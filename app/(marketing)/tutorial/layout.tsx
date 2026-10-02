import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tutorial',
  description: 'Learn how to use StoryForge: projects, characters, worldbuilding and exports.',
};

export default function TutorialLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
