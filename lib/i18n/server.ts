import { cookies, headers } from "next/headers";
import type { Locale } from "./config";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, COOKIE_KEY } from "./config";
import { en } from "./translations/en";
import { fr } from "./translations/fr";

const translations = { en, fr } as const;

export type TranslationKeys = typeof en;

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIE_KEY)?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "";
  const preferred = parseAcceptLanguage(acceptLanguage);
  if (preferred) return preferred;

  return DEFAULT_LOCALE;
}

function parseAcceptLanguage(header: string): Locale | null {
  const locales = header
    .split(",")
    .map((part) => {
      const [lang, q = "1"] = part.trim().split(";q=");
      return { lang: lang.split("-")[0].toLowerCase(), q: parseFloat(q) };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of locales) {
    if (SUPPORTED_LOCALES.includes(lang as Locale)) {
      return lang as Locale;
    }
  }

  return null;
}

export async function getServerTranslations() {
  const locale = await getServerLocale();
  const messages = translations[locale];

  const t = (key: string, params?: Record<string, string | number>): string => {
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
  };

  return { t, locale };
}
