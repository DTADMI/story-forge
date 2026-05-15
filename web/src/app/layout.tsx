import '../styles/globals.css';
import {Header} from '@/components/layout/header';
import {Footer} from '@/components/layout/footer';
import {PWAInstallPrompt} from '@/components/pwa/install-prompt';
import {ServiceWorkerRegistration} from '@/components/pwa/service-worker-registration';
import {Providers} from '@/components/providers';
import {ToastProvider} from '@/components/toast';

export const metadata = {
  title: 'StoryForge',
  description: 'Gamified writing platform',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'StoryForge',
    statusBarStyle: 'default',
  },
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className="bg-bg text-fg min-h-screen">
    <ServiceWorkerRegistration/>
    <PWAInstallPrompt/>
    <Providers>
      <ToastProvider>
        <Header/>
        <div className="min-h-[calc(100vh-200px)]">{children}</div>
        <Footer/>
      </ToastProvider>
    </Providers>
      </body>
    </html>
  );
}
