import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';

export default function ComponentsDemoUIPage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <h1 className="prose-lite">UI Components</h1>

            <section className="mt-6 grid gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button isLoading>Loading</Button>
                </div>

                <div className="grid gap-2">
                    <Input placeholder="Email"/>
                    <Textarea
                        placeholder="Tell us more…"
                        description="You can write markdown."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="muted">Muted</Badge>
                </div>

                <Card className="shadow-elev-1">
                    <CardHeader>
                        <CardTitle>Card Title</CardTitle>
                        <CardDescription>Short description using tokens.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-fg/80 text-sm">
                            Cards use semantic colors and elevation utilities.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button>Action</Button>
                    </CardFooter>
                </Card>
            </section>
        </main>
    );
}
