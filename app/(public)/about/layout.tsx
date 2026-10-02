import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About StoryForge, the gamified creative writing platform for novelists and screenwriters.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
