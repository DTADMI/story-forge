import { getServerLocale } from "./server";
import { I18nProvider } from "./provider";
import type { ReactNode } from "react";

export async function ServerI18nProvider({ children }: { children: ReactNode }) {
  const locale = await getServerLocale();
  return <I18nProvider initialLocale={locale}>{children}</I18nProvider>;
}
