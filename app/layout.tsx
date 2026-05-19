import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "../styles/globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PWAInstallPrompt } from "@/components/pwa/install-prompt";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { Providers } from "@/components/providers";
import { ToastProvider } from "@/components/toast";
import { SkipLink } from "@/components/a11y/skip-link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "StoryForge",
  description: "Gamified writing platform",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "StoryForge",
    statusBarStyle: "default",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-bg text-fg min-h-screen">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SkipLink />
          <ServiceWorkerRegistration />
          <PWAInstallPrompt />
          <OfflineIndicator />
          <Providers>
            <ToastProvider>
              <Header />
              <main
                id="main-content"
                aria-label="Main content"
                className="min-h-[calc(100vh-200px)]"
              >
                {children}
              </main>
              <Footer />
            </ToastProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
