import Link from "next/link";
import { BookOpen, Users, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(39,103,73,0.12),transparent_60%)]" />
        <div className="container mx-auto max-w-4xl px-4 py-20 sm:py-28 relative">
          <div className="text-center space-y-6">
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              Forge Your{" "}
              <span className="bg-gradient-to-r from-brand-1 via-brand-3 to-brand-2 bg-clip-text text-transparent">
                Story
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-balance">
              A gamified creative writing platform for novelists, screenwriters, and visual
              storytellers. Build immersive worlds, track characters, and share stories — all while
              protecting your wellbeing.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium min-h-10 px-6 py-2.5 bg-gradient-to-r from-brand-1 to-brand-2 text-white shadow-sm shadow-brand-2/20 hover:shadow-md hover:shadow-brand-2/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Writing Free
              </Link>
              <Link
                href="/feed"
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium min-h-10 px-6 py-2.5 border border-input bg-card text-foreground shadow-xs hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Explore Stories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-5xl px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="mt-2 text-muted-foreground">
            Everything you need to write consistently and build your world.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Write & Track",
              desc: "Set daily goals, track word counts, and build a consistent writing habit with streak tracking.",
            },
            {
              icon: Users,
              title: "Build Worlds",
              desc: "Create characters, locations, timelines, and dialogue. Manage organizations, species, and lore.",
            },
            {
              icon: Trophy,
              title: "Stay Motivated",
              desc: "Earn Ink, unlock badges, compete on leaderboards, and share your progress with friends.",
            },
          ].map((f) => (
            <Card
              key={f.title}
              className="p-6 text-center border-border/60 hover:border-primary/30 transition-colors"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Ready to start your story?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Join writers from around the world who are building better habits.
          </p>
          <div className="mt-6">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium min-h-10 px-6 py-2.5 bg-gradient-to-r from-brand-1 to-brand-2 text-white shadow-sm shadow-brand-2/20 hover:shadow-md hover:shadow-brand-2/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              Create Your Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
