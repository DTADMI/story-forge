import { getServerLocale } from "./server";
import { I18nProvider } from "./provider";

export async function ServerI18nProvider({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  return <I18nProvider initialLocale={locale}>{children}</I18nProvider>;
}
