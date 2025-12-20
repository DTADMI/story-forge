import '../styles/globals.css';
import {Header} from '@/components/layout/header';
import {Footer} from '@/components/layout/footer';

export const metadata = {
  title: 'StoryForge',
  description: 'Gamified writing platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-fg">
      <Header/>
      <div className="min-h-[calc(100vh-200px)]">{children}</div>
      <Footer/>
      </body>
    </html>
  );
}
