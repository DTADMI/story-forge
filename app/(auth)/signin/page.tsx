"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { createBrowserClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-extrabold text-center mb-8">
        {t("auth.signInTitle")}
      </h1>

      {/* OAuth */}
      <div className="mb-6 space-y-2">
        <button
          onClick={() => handleOAuth("google")}
          className="w-full flex items-center justify-center gap-2 py-2 border border-fg/20 rounded-md text-sm hover:bg-fg/5"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {t("auth.continueWithGoogle")}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <hr className="flex-1 border-fg/10" />
        <span className="text-xs text-fg/40">{t("auth.or")}</span>
        <hr className="flex-1 border-fg/10" />
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("auth.email")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("auth.password")}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? t("auth.signingIn") : t("auth.signInTitle")}
        </button>
      </form>
      <p className="text-sm text-fg/40 text-center mt-4">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="text-brand hover:underline">
          {t("common.signUp")}
        </Link>
      </p>
      <p className="text-sm text-fg/40 text-center mt-1">
        <Link href="/reset-password" className="hover:text-brand">
          {t("auth.forgotPassword")}
        </Link>
      </p>
    </main>
  );
}
