"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UtensilsCrossed, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErr('Please enter your email and password.');
      return;
    }
    setErr('');
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      success('Welcome back! 👋', '');
      router.push('/');
    } catch (e: any) {
      setErr(e.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-indigo">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
          <p className="text-sm text-ink-muted mt-1">Sign in to your BiteBuddy account</p>
        </div>

        <form onSubmit={handleSubmit} className="bb-card p-6 space-y-4">
          {err && (
            <div className="bg-danger-50 border border-danger-200 text-danger-600 text-sm rounded-xl px-4 py-3 animate-fade-in">
              {err}
            </div>
          )}

          <div>
            <label className="bb-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bb-input"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="bb-label mb-0" htmlFor="password">Password</label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bb-input pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm mt-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              : 'Sign in'}
          </button>

          <p className="text-center text-sm text-ink-muted">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
