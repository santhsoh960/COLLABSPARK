import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * GET /auth/callback
 *
 * Handles all Supabase OAuth + email-based auth callbacks:
 *   - Google OAuth (PKCE code exchange)
 *   - Magic link / email confirmation
 *   - Password reset redirect
 *
 * Flow:
 *   1. Exchange the one-time `code` for a session via PKCE
 *   2. Check whether the user has completed profile setup
 *   3. Redirect to /discover (existing profile) or /setup-profile (new user)
 *   4. On any error, redirect to /login with a descriptive error query param
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get('code');
  // `next` lets other parts of the app (e.g. password reset) specify a redirect
  const next = searchParams.get('next') ?? '/discover';
  // `error` / `error_description` are sent by Supabase when OAuth is denied
  const oauthError = searchParams.get('error');
  const oauthErrorDescription = searchParams.get('error_description');

  // ── OAuth error forwarded by Supabase (e.g. user cancelled Google login) ──
  if (oauthError) {
    const params = new URLSearchParams({
      error: oauthError,
      ...(oauthErrorDescription && { error_description: oauthErrorDescription }),
    });
    return NextResponse.redirect(`${origin}/login?${params.toString()}`);
  }

  // ── No code present — nothing to exchange ──
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  // ── Exchange the PKCE code for a Supabase session ──
  const supabase = createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('[auth/callback] Code exchange failed:', exchangeError.message);

    // Expired or already-used code
    if (
      exchangeError.message.includes('expired') ||
      exchangeError.message.includes('already been used')
    ) {
      return NextResponse.redirect(`${origin}/login?error=link_expired`);
    }

    return NextResponse.redirect(
      `${origin}/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`
    );
  }

  // ── Retrieve the authenticated user (server-verified, not just the JWT) ──
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('[auth/callback] getUser failed:', userError?.message);
    return NextResponse.redirect(`${origin}/login?error=no_user`);
  }

  // ── Upsert basic metadata from Google OAuth if it's a new social sign-in ──
  // This is a no-op for email/password users; only runs when user metadata exists
  // and there's a full_name present (populated by Google OAuth).
  const googleName = user.user_metadata?.full_name as string | undefined;
  const googleAvatar = user.user_metadata?.avatar_url as string | undefined;

  // ── Check whether the user has completed profile setup ──
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .maybeSingle(); // Use maybeSingle() instead of single() — avoids error when no row exists

  const hasProfile = !!profile?.username;

  if (hasProfile) {
    // Fully set up — go to the main app
    return NextResponse.redirect(`${origin}/discover`);
  }

  // ── New user or incomplete profile — pre-populate what we can from OAuth ──
  // If Google provided a name/avatar and the row doesn't exist yet, we insert
  // a partial row so the setup form can pre-fill the display name.
  if (googleName || googleAvatar) {
    await supabase.from('profiles').upsert(
      {
        id: user.id,
        display_name: googleName ?? null,
        avatar_url: googleAvatar ?? null,
      },
      {
        // Only insert — don't overwrite fields the user may have already set
        onConflict: 'id',
        ignoreDuplicates: true,
      }
    );
  }

  // Respect an explicit `next` param (e.g. from password reset flow)
  if (next !== '/discover') {
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/setup-profile`);
}
