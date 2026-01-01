import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {apiFetch} from '@/lib/api';
import {redirect} from 'next/navigation';
import {Card} from '@/components/ui/card';
import Link from 'next/link';

async function getCharacters() {
    const res = await apiFetch('/world/characters', {cache: 'no-store'});
    if (!res.ok) return [];
    return res.json();
}

async function getLocations() {
    const res = await apiFetch('/world/locations', {cache: 'no-store'});
    if (!res.ok) return [];
    return res.json();
}

export default async function WorldPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/signin');

    const [characters, locations] = await Promise.all([
        getCharacters(),
        getLocations(),
    ]);

    return (
        <main className="mx-auto max-w-5xl px-6 py-10 space-y-12">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold">World Building</h1>
                    <p className="text-fg/60 mt-1">Manage your story's characters, locations, and lore.</p>
                </div>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Characters</h2>
                        <Link href="/world/characters/new" className="text-sm text-brand font-medium hover:underline">
                            + New Character
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {characters.length === 0 ? (
                            <p className="text-sm text-fg/40">No characters yet.</p>
                        ) : (
                            characters.map((c: any) => (
                                <Card key={c.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold">{c.name}</h3>
                                        {c.traits && <p className="text-xs text-fg/60 italic">{c.traits}</p>}
                                    </div>
                                    <Link href={`/world/characters/${c.id}`}
                                          className="text-xs text-fg/40 hover:text-brand">
                                        Edit
                                    </Link>
                                </Card>
                            ))
                        )}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Locations</h2>
                        <Link href="/world/locations/new" className="text-sm text-brand font-medium hover:underline">
                            + New Location
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {locations.length === 0 ? (
                            <p className="text-sm text-fg/40">No locations yet.</p>
                        ) : (
                            locations.map((l: any) => (
                                <Card key={l.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold">{l.name}</h3>
                                        {l.description &&
                                            <p className="text-xs text-fg/60 line-clamp-1">{l.description}</p>}
                                    </div>
                                    <Link href={`/world/locations/${l.id}`}
                                          className="text-xs text-fg/40 hover:text-brand">
                                        Edit
                                    </Link>
                                </Card>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
