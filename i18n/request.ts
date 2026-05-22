import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  let messages: Record<string, unknown> = {};
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    // Fallback to empty messages if JSON is unavailable during build
  }

  return { locale, messages };
});
