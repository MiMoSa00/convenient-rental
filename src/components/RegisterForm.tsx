'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, CheckCircle, User, Mail, Lock } from 'lucide-react';

interface ApiResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  message: string;
  error?: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    // Basic validation
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting registration for:', email);

      // Use absolute URL to avoid issues with base href or proxies
      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/register`;

      // Abort fetch after 10s to avoid long hangs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            name,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      // Log response info for debugging
      console.log('Register response status:', response.status);
      console.log('Register response content-type:', response.headers.get('content-type'));

      // Parse JSON only if content-type indicates JSON
      let data: ApiResponse | null = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = (await response.json()) as ApiResponse;
        } catch (parseError) {
          console.error('Failed to parse JSON from register response:', parseError);
          // Read the text for server logs but don't show raw HTML to user
          const text = await response.text().catch(() => '');
          console.error('Register response body (non-json):', text);
          throw new Error(`Server returned invalid JSON (status ${response.status}). Check server logs.`);
        }

        if (!response.ok || !data?.success) {
          throw new Error(data?.error || data?.message || 'Registration failed');
        }
      } else {
        // Non-JSON response (likely an HTML error page). Log it and show friendly message.
        const text = await response.text().catch(() => '');
        console.error('Register returned non-JSON response:', { status: response.status, body: text });
        throw new Error(`Server returned non-JSON response (status ${response.status}). Check server logs.`);
      }

      // Success
      console.log('Registration successful:', data);
      setLoading(false);
      setSuccess(true);

      // Store user name in localStorage
      if (data.user?.name) {
        localStorage.setItem('userName', data.user.name);
      }

      // Redirect after a brief success message
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      // Provide clearer messages for common failure modes
      if ((error as any)?.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.toLowerCase().includes('network')) {
        setError('Network error: cannot reach the server. Is the dev server running?');
      } else {
        setError(errorMessage || 'Registration failed');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-2xl shadow-elegant p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-muted-foreground">
              Join us to find your perfect roommate
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Account created successfully!</p>
                <p className="text-xs mt-1">Redirecting to login...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <svg
                className="h-5 w-5 flex-shrink-0 mt-0.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  disabled={loading || success}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading || success}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  disabled={loading || success}
                  className="w-full pl-10 pr-12 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || success}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Account created!
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Help Text */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}