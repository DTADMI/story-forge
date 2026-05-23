import { Inter, Space_Grotesk } from "next/font/google";
import "../styles/globals.css";
import { Providers } from "@/components/providers";
import { ToastProvider } from "@/components/toast";
import { SkipLink } from "@/components/a11y/skip-link";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "StoryForge",
  description: "Gamified creative writing platform for novelists, screenwriters, and storytellers.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StoryForge",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbfc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

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
        <SkipLink />
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
        <ServiceWorkerRegistration />
        <OfflineIndicator />
      </body>
    </html>
  );
}
