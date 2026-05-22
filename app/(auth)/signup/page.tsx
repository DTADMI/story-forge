"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || undefined },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      try {
        await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } catch {
        // ignore verification email failure
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      try {
        await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } catch {
        // ignore verification email failure
      }
      router.push("/signin?message=check_email");
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  };

  const errorId = "signup-error";
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-extrabold text-center mb-8">Create Account</h1>

      <form
        aria-describedby={error || undefined ? errorId : undefined}
        onSubmit={handleSignUp}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
          />
        </div>
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
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
          />
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
      <p className="text-sm text-fg/40 text-center mt-4">
        Already have an account?{" "}
        <Link href="/signin" className="text-brand hover:underline">
          Sign In
        </Link>
      </p>
    </main>
  );
}
