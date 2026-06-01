'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/login`,
      });

      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Unable to connect. Please check your internet connection and try again.');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🔥</span>
            <span className="text-2xl font-bold font-heading gradient-text">
              CollabSpark
            </span>
          </Link>
        </div>

        <div className="glass-card p-6 sm:p-8">
          {sent ? (
            <div className="text-center animate-fade-in">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="font-heading text-xl font-semibold mb-2">
                Check Your Email
              </h2>
              <p className="text-sm text-muted mb-6">
                We&apos;ve sent a password reset link to{' '}
                <span className="text-white font-medium">{email}</span>
              </p>
              <Link
                href="/login"
                className="btn-outline text-sm inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-xl font-semibold mb-2 text-center">
                Reset Password
              </h2>
              <p className="text-sm text-muted text-center mb-6">
                Enter your email and we&apos;ll send you a reset link
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-dark pl-10 text-sm"
                  />
                </div>

                {error && (
                  <div className="bg-red-400/10 text-red-400 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gradient w-full py-3 text-sm disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-sm text-muted mt-6">
                <Link
                  href="/login"
                  className="text-coral hover:underline font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
