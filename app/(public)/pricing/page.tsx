import { isEnabledSync } from "@/lib/flags";

export const revalidate = 3600;

import { SubscribeButton } from "@/components/billing/SubscribeButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Start writing and building your world",
    features: [
      "Up to 3 projects",
      "Up to 10 characters",
      "Basic world-building tools",
      "Community features",
      "Writing goals & streaks",
      "Public story feed",
    ],
    cta: "Get Started",
    href: "/signup",
  },
  {
    name: "Explorer",
    price: "$4.99",
    period: "/month",
    description: "For dedicated world-builders",
    features: [
      "Up to 10 projects",
      "Up to 50 characters",
      "Advanced world-building",
      "PDF & EPUB export",
      "AI writing suggestions (10/day)",
      "Writing competitions",
    ],
    cta: "Subscribe",
    plan: "monthly" as const,
    featured: true,
  },
  {
    name: "Creator",
    price: "$9.99",
    period: "/month",
    description: "For professional storytellers",
    features: [
      "Unlimited projects",
      "Unlimited characters",
      "Full encyclopedia & lore",
      "AI assistant (100/day)",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Subscribe",
    plan: "yearly" as const,
  },
  {
    name: "Creator",
    price: "$9.99",
    period: "/month",
    description: "For professional storytellers",
    features: [
      "Unlimited projects",
      "Unlimited characters",
      "Full encyclopedia & lore",
      "AI assistant (100/day)",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Subscribe",
    href: "/api/billing/checkout?plan=yearly",
  },
];

export default function PricingPage() {
  const paymentsEnabled = isEnabledSync("payments");

  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Simple Pricing</h1>
          <p className="mt-2 text-muted-foreground">
            Start for free. Upgrade when you need more power.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <Card
              key={`${tier.name}-${i}`}
              className={`relative flex flex-col p-6 ${tier.featured ? "border-primary/50 ring-1 ring-primary/20 shadow-md" : ""}`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <div className="mb-4">
                <h2 className="font-display text-lg font-bold">{tier.name}</h2>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>
              <div className="mb-6">
                <span className="font-display text-4xl font-extrabold">{tier.price}</span>
                {tier.period && (
                  <span className="text-muted-foreground text-sm">{tier.period}</span>
                )}
              </div>
              <ul className="flex-1 space-y-2 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              {tier.name === "Free" ? (
                <Link
                  href={tier.href || "/signup"}
                  className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium min-h-9 px-4 py-2 w-full border border-input bg-card text-foreground shadow-xs hover:border-primary/40 hover:bg-primary/10 transition-all duration-200"
                >
                  {tier.cta}
                </Link>
              ) : paymentsEnabled ? (
                <SubscribeButton plan={tier.plan || "monthly"} />
              ) : (
                <Button className="w-full" disabled>
                  Coming Soon
                </Button>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="font-display text-2xl font-bold">All plans include</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 text-left">
            {[
              "Unlimited story worlds",
              "Character & location management",
              "Timeline visualization",
              "Dialogue scripting",
              "Writing goals & streaks",
              "Badge achievements",
              "Dark mode",
              "Mobile responsive",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" /> {f}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
