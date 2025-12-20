import {flags} from '@/lib/flags';
import {Button} from '@/components/ui/button';

export default function PricingPage() {
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
                    <a className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-white" href="/signup">
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
                    {flags.payments ? (
                        <Button variant="outline" className="mt-4" asChild>
                            <a href="#checkout">Subscribe</a>
                        </Button>
                    ) : (
                        <Button variant="outline" className="mt-4" disabled title="Payments disabled via feature flag">
                            Payments disabled
                        </Button>
                    )}
                </div>
            </div>
            <p className="mt-8 text-[color:var(--fg)]/70">Team plans coming later.</p>
        </main>
    );
}
