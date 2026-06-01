'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    if (!confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGlobalError('');
    setSuccessMessage('');

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          // Ensures the email confirmation link redirects correctly on Vercel
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Provide human-friendly error messages
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          setGlobalError('This email is already registered. Try logging in instead.');
        } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
          setGlobalError('Too many attempts. Please wait a moment and try again.');
        } else {
          setGlobalError(error.message);
        }
        return;
      }

      // Check if email confirmation is required
      if (data?.user && !data.session) {
        // Supabase requires email confirmation
        setSuccessMessage(
          `We've sent a confirmation email to ${email}. Please check your inbox and click the link to activate your account.`
        );
      } else if (data?.user && data.session) {
        // Auto-confirmed (e.g., email confirmation disabled in Supabase dashboard)
        router.push('/setup-profile');
      }
    } catch (err: unknown) {
      console.error('Signup error:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setGlobalError(
          'Unable to connect to the server. Please check your internet connection and try again. If the problem persists, the service may be temporarily unavailable.'
        );
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        setGlobalError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setGlobalError(error.message);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect with Google';
      setGlobalError(errorMessage);
    }
  };

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🔥</span>
            <span className="text-2xl font-bold font-heading gradient-text">
              CollabSpark
            </span>
          </Link>
          <p className="text-muted text-sm mt-2">
            Create your account to get started
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-accent/10 text-accent text-sm px-4 py-3 rounded-xl mb-4 leading-relaxed">
              <p className="font-semibold mb-1">✅ Check Your Email!</p>
              <p>{successMessage}</p>
            </div>
          )}

          {!successMessage && (
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                    placeholder="Your full name"
                    autoComplete="name"
                    className={`input-dark pl-10 text-sm ${
                      errors.fullName ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`input-dark pl-10 text-sm ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className={`input-dark pl-10 pr-10 text-sm ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword)
                        setErrors({ ...errors, confirmPassword: '' });
                    }}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className={`input-dark pl-10 pr-10 text-sm ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {globalError && (
                <div className="bg-red-400/10 text-red-400 text-sm px-4 py-3 rounded-xl leading-relaxed">
                  {globalError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-gradient w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          {!successMessage && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-dark-border" />
                <span className="text-xs text-muted">or</span>
                <div className="flex-1 h-px bg-dark-border" />
              </div>

              {/* Google */}
              <button
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* Login Link */}
          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-coral hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
