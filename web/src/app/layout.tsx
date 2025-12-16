export const metadata = {
  title: 'StoryForge',
  description: 'Gamified writing platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
