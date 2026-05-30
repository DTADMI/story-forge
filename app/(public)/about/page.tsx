import { BookOpen, Globe, Shield, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

export const revalidate = 86400;

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
          <BookOpen className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl font-extrabold tracking-tight">About StoryForge</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            A gamified writing platform designed to help writers build worlds, track characters, and
            share stories — all while protecting your wellbeing.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-4 py-16 space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="p-6">
            <Globe className="h-6 w-6 text-primary mb-3" />
            <h2 className="font-display font-semibold mb-2">World Building</h2>
            <p className="text-sm text-muted-foreground">
              Comprehensive tools for characters, locations, timelines, dialogues, and lore.
              Visualize relationships in galaxy graphs and interactive maps.
            </p>
          </Card>
          <Card className="p-6">
            <Users className="h-6 w-6 text-primary mb-3" />
            <h2 className="font-display font-semibold mb-2">Social Writing</h2>
            <p className="text-sm text-muted-foreground">
              Follow writers, join groups, share your work with privacy scopes, and participate in
              writing competitions.
            </p>
          </Card>
          <Card className="p-6">
            <Shield className="h-6 w-6 text-primary mb-3" />
            <h2 className="font-display font-semibold mb-2">Privacy First</h2>
            <p className="text-sm text-muted-foreground">
              Granular visibility controls: private, friends-only, authenticated users, or public.
              You decide who sees your work.
            </p>
          </Card>
          <Card className="p-6">
            <BookOpen className="h-6 w-6 text-primary mb-3" />
            <h2 className="font-display font-semibold mb-2">Habit Building</h2>
            <p className="text-sm text-muted-foreground">
              Gamified motivation with goals, streaks, badges, and Ink currency. Stay consistent and
              celebrate your progress.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
