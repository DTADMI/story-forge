"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function HeaderUser() {
  const t = useTranslations();
  const supabase = createBrowserClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
      setLoading(false);
    });
  }, [supabase]);

  if (loading) return <span />;
  if (!user) {
    return (
      <Link href="/signin" style={{ fontWeight: 600 }}>
        {t("common.signIn")}
      </Link>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: "#374151", fontSize: 14 }}>{user.email}</span>
      <button
        onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/"))}
        style={{
          border: 0,
          background: "transparent",
          color: "#0e3fa9",
          cursor: "pointer",
        }}
      >
        {t("common.signOut")}
      </button>
    </div>
  );
}
