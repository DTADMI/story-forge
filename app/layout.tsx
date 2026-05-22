import { Inter, Space_Grotesk } from "next/font/google";
import "../styles/globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { ToastProvider } from "@/components/toast";
import { SkipLink } from "@/components/a11y/skip-link";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";

export const dynamic = "force-dynamic";
export const metadata = { title: "StoryForge", description: "Gamified writing platform" };
export const viewport = { width: "device-width", initialScale: 1, maximumScale: 5 };

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <Providers>
          <ToastProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main id="main-content" tabIndex={-1} className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
