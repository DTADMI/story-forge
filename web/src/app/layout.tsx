import '../styles/globals.css';

export const metadata = {
  title: 'StoryForge',
  description: 'Gamified writing platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-fg">
        {children}
      </body>
    </html>
  );
}
