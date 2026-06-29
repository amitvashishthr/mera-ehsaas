"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/reset-password`,
      }
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
      showToast("Reset link sent! Check your email.", "success");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl font-semibold text-primary-900 dark:text-dark-100">
            Reset Password
          </h1>
          <p className="text-sm text-primary-400 dark:text-dark-400 mt-1">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <span className="text-4xl block mb-4">✉️</span>
            <p className="text-primary-700 dark:text-dark-200 font-medium mb-2">
              Check your inbox
            </p>
            <p className="text-sm text-primary-400 dark:text-dark-400 mb-6">
              We sent a password reset link to <strong className="text-primary-700 dark:text-dark-200">{email}</strong>.
              Click the link in the email to reset your password.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="btn-ghost text-sm"
            >
              Send to a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-primary-600 dark:text-dark-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field text-sm"
                placeholder="your@email.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-primary-500 dark:text-dark-400">
          Remember your password?{" "}
          <Link href="/login" className="text-accent-600 hover:text-accent-700 dark:text-accent-400 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
