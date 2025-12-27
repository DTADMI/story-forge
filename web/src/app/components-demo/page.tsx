import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card';
import {Tabs} from '@/components/ui/tabs';

export default function ComponentsDemoPage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <h1 className="mb-4 text-2xl font-extrabold">Components Demo</h1>
            <section className="mb-8 space-y-4">
                <h2 className="text-xl font-bold">Buttons</h2>
                <div className="flex flex-wrap gap-3">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                </div>
            </section>

            <section className="mb-8 space-y-4">
                <h2 className="text-xl font-bold">Input</h2>
                <div className="max-w-sm">
                    <Input placeholder="Your email" type="email"/>
                </div>
            </section>

            <section className="mb-8 space-y-4">
                <h2 className="text-xl font-bold">Card</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Example Card</CardTitle>
                        <CardDescription>
                            Use cards to group related content.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
                        eget ipsum et justo bibendum iaculis.
                    </CardContent>
                    <CardFooter>Footer content</CardFooter>
                </Card>
            </section>

            <section className="mb-8 space-y-4">
                <h2 className="text-xl font-bold">Tabs</h2>
                <Tabs
                    items={[
                        {label: 'Overview', value: 'overview'},
                        {label: 'Details', value: 'details'},
                        {label: 'Reviews', value: 'reviews'},
                    ]}
                >
                    <div className="py-3 text-sm text-[color:var(--fg)]/70">
                        Switch tabs above to change sections.
                    </div>
                </Tabs>
            </section>
        </main>
    );
}
