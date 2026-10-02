import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download',
  description: 'Download StoryForge for desktop and mobile.',
};

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
