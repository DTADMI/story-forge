import { isEnabledSync } from "@/lib/flags";
import { SubscribeButton } from "@/components/billing/SubscribeButton";

export default function PricingPage() {
  const paymentsEnabled = isEnabledSync("payments");

  return (
    <main className="prose-lite mx-auto max-w-3xl px-6 py-12">
      <h1>Pricing</h1>
      <p>Start for free. Upgrade when you need more power.</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-[color:var(--fg)]/15 p-6">
          <h2 className="text-xl font-bold">Free</h2>
          <ul>
            <li>Up to 3 projects</li>
            <li>Basic world-building tools</li>
            <li>Community features</li>
          </ul>
          <a
            className="bg-brand mt-4 inline-block rounded-md px-4 py-2 text-white"
            href="/signup"
          >
            Get Started
          </a>
        </div>
        <div className="rounded-lg border border-[color:var(--fg)]/15 p-6">
          <h2 className="text-xl font-bold">Premium — $9.99/mo</h2>
          <ul>
            <li>Unlimited projects</li>
            <li>Advanced world-building modules</li>
            <li>PDF/EPUB export, 3D maps, advanced analytics</li>
          </ul>
          {paymentsEnabled ? (
            <div className="mt-4 space-y-2">
              <SubscribeButton plan="monthly" />
              <SubscribeButton plan="yearly" />
            </div>
          ) : (
            <p
              className="mt-4 text-sm text-fg/40"
              title="Payments disabled via feature flag"
            >
              Payments disabled
            </p>
          )}
        </div>
      </div>
      <p className="mt-8 text-[color:var(--fg)]/70">
        Team plans coming later.
      </p>
    </main>
  );
}
