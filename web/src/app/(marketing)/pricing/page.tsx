import {flags} from '@/lib/flags';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {SubscribeButton} from '@/components/billing/SubscribeButton';

export default function PricingPage() {
    const paymentsEnabled = flags.payments;
  return (
      <section className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="mb-3 text-3xl font-extrabold">Pricing</h1>
          <p className="mb-6 text-fg/80">Start free and upgrade anytime. Pricing reflects the roadmap documented in
              docs.</p>
          {!paymentsEnabled && (
              <div className="mb-4 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
                  Payments are coming soon. You can explore tiers below; subscription checkout is disabled in this
                  build.
        </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                  <CardHeader>
                      <CardTitle>Free</CardTitle>
                      <CardDescription>3 active projects, basic tools, community features.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-extrabold">$0</div>
                  </CardContent>
                  <CardFooter>
                      <Button variant="outline" className="w-full">Get Started</Button>
                  </CardFooter>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle>Premium</CardTitle>
                      <CardDescription>Unlimited projects, advanced tools, PDF/EPUB export, analytics.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-extrabold">$9.99/mo</div>
                  </CardContent>
                  <CardFooter>
                      {paymentsEnabled ? (
                          <SubscribeButton plan="monthly"/>
                      ) : (
                          <Button className="w-full" disabled aria-disabled>
                              Coming soon
                      </Button>
                      )}
                  </CardFooter>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle>Team</CardTitle>
                      <CardDescription>Collaboration, advanced permissions, shared resources, team
                          analytics.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-extrabold">$24.99/mo</div>
                  </CardContent>
                  <CardFooter>
                      {paymentsEnabled ? (
                          <SubscribeButton plan="yearly"/>
                      ) : (
                          <Button className="w-full" disabled aria-disabled>
                              Coming soon
                      </Button>
                      )}
                  </CardFooter>
              </Card>
      </div>
    </section>
  );
}
