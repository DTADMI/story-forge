"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Locale } from "./config";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, STORAGE_KEY, COOKIE_KEY } from "./config";
import { en } from "./translations/en";
import { fr } from "./translations/fr";

const translations = { en, fr } as const;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolveClientLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
    return stored as Locale;
  }

  for (const lang of navigator.languages) {
    const normalized = lang.split("-")[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(normalized as Locale)) {
      return normalized as Locale;
    }
  }

  return DEFAULT_LOCALE;
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale ?? resolveClientLocale());

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, nextLocale);
      document.cookie = `${COOKIE_KEY}=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const messages = translations[locale];
      const keys = key.split(".");
      let value: unknown = messages;
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key;
        }
      }

      if (typeof value !== "string") return key;

      if (params) {
        return Object.entries(params).reduce(
          (acc, [paramKey, paramValue]) => acc.replace(`{{${paramKey}}}`, String(paramValue)),
          value
        );
      }

      return value;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
