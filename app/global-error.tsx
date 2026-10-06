"use client";

import { useEffect, useSyncExternalStore } from "react";

// ─────────────────────────────────────────────────────────
// Frontiere d'erreur GLOBALE.
//
// Next.js impose qu'elle rende son propre <html>/<body>, donc elle est HORS du
// provider i18n : pas de contexte disponible. Et comme elle s'affiche quand
// quelque chose de profond a casse, importer le module i18n serait le risque
// meme qu'on cherche a eviter. Les messages sont donc ecrits ici, en clair.
// Repli : le FRANCAIS, langue par defaut du produit (NF-I18N). La version
// precedente affichait de l'anglais code en dur, sans meme un attribut lang.
// ─────────────────────────────────────────────────────────

type SupportedLocale = "fr" | "en";

const DEFAULT_LOCALE: SupportedLocale = "fr";
const COOKIE_KEY = "storyforge-locale";

const MESSAGES: Record<
  SupportedLocale,
  { body: string; retry: string; details: string }
> = {
  fr: {
    body: "Une erreur est survenue. Notre equipe en a ete informee.",
    retry: "Reessayer",
    details: "Details techniques",
  },
  en: {
    body: "Something went wrong. Our team has been notified.",
    retry: "Try again",
    details: "Technical details",
  },
};

function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  return value === "fr" || value === "en";
}

/** Locale lue sans contexte : cookie, puis stockage local, puis le defaut. */
function readLocale(): SupportedLocale {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_KEY}=([^;]+)`));
    if (isSupportedLocale(match?.[1])) return match[1];
  } catch {
    // Acces au cookie impossible dans certains contextes durcis.
  }
  try {
    const stored = window.localStorage.getItem(COOKIE_KEY);
    if (isSupportedLocale(stored)) return stored;
  } catch {
    // Stockage indisponible : on garde le defaut.
  }
  return DEFAULT_LOCALE;
}

const subscribeCookie = () => () => {};
const getLocaleSnapshot = (): SupportedLocale => readLocale();
const getServerLocaleSnapshot = (): SupportedLocale => DEFAULT_LOCALE;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useSyncExternalStore(subscribeCookie, getLocaleSnapshot, getServerLocaleSnapshot);
  const messages = MESSAGES[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <html lang={locale}>
      <body
        style={{
          background: "#0b0b0f",
          color: "#f4f4f5",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 500, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>StoryForge</h1>
          <p style={{ fontSize: 14, color: "#a1a1aa", margin: "0 0 24px" }}>{messages.body}</p>
          <button
            onClick={() => reset()}
            style={{
              background: "#3f7cff",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {messages.retry}
          </button>
          <details style={{ marginTop: 24, textAlign: "left" }}>
            <summary style={{ fontSize: 12, color: "#71717a", cursor: "pointer" }}>
              {messages.details}
            </summary>
            <pre
              style={{
                fontSize: 11,
                color: "#f87171",
                marginTop: 8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {error.message}
            </pre>
          </details>
        </div>
      </body>
    </html>
  );
}
