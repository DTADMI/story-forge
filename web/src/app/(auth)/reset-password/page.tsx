"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-extrabold text-center mb-4">Reset Password</h1>

      {sent ? (
        <div className="text-center space-y-4">
          <p className="text-sm text-fg/60">
            If an account exists for {email}, you&apos;ll receive a password reset link shortly.
          </p>
          <Link href="/signin" className="text-sm text-brand hover:underline">
            ← Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <p className="text-sm text-fg/60 text-center">
            Enter your email and we&apos;ll send you a reset link.
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <p className="text-sm text-fg/40 text-center">
            <Link href="/signin" className="text-brand hover:underline">
              ← Back to Sign In
            </Link>
          </p>
        </form>
      )}
    </main>
  );
}
