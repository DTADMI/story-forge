import { Card } from "@/components/ui/card";

export const revalidate = 86400;

const faqs = [
  {
    q: "Is StoryForge free?",
    a: "Yes, the Free plan includes up to 3 projects, 10 characters, basic world-building tools, and community features. Upgrade for more capacity and advanced features.",
  },
  {
    q: "Can I export my work?",
    a: "Yes. You can export projects as Markdown, EPUB, or PDF from the project editor toolbar. Your work is always yours.",
  },
  {
    q: "Who can see my stories?",
    a: "You control visibility with four privacy scopes: Private (only you), Friends (mutual follows), Authenticated Users, and Public (anyone).",
  },
  {
    q: "What writing formats do you support?",
    a: "Novels, screenplays, comics, graphic novels, and webtoons. Set goals in words, pages, panels, or scenes.",
  },
  {
    q: "How does the gamification work?",
    a: "Set daily or weekly writing goals. Earn Ink for progress, unlock badges at milestones, and build streaks. Compete on leaderboards.",
  },
  {
    q: "Can I collaborate with others?",
    a: "You can share projects with collaborators, join writing groups, and invite friends to read your work. Real-time collaboration is planned.",
  },
];

export default function FAQPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-muted-foreground">
            Everything you need to know about StoryForge.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-16">
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.q} className="p-6">
              <h2 className="font-display font-semibold">{faq.q}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
