import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {apiFetch} from '@/lib/api';
import {redirect} from 'next/navigation';
import {Card} from '@/components/ui/card';

async function createCharacter(formData: FormData) {
    'use server';
    const name = String(formData.get('name') || '').trim();
    const traits = String(formData.get('traits') || '').trim();
    const bio = String(formData.get('bio') || '').trim();

    if (!name) return;

    await apiFetch('/world/characters', {
        method: 'POST',
        body: JSON.stringify({name, traits, bio}),
    });
    redirect('/world');
}

export default async function NewCharacterPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/signin');

    return (
        <main className="mx-auto max-w-2xl px-6 py-10">
            <h1 className="text-2xl font-extrabold mb-6">Create New Character</h1>
            <Card className="p-6">
                <form action={createCharacter} className="grid gap-4">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input name="name" required
                               className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Traits / Keywords</label>
                        <input name="traits" placeholder="e.g. Brave, Impatient, Noble"
                               className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Bio / Backstory</label>
                        <textarea name="bio" rows={5}
                                  className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"/>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <a href="/world"
                           className="px-4 py-2 text-sm font-medium border border-fg/20 rounded-md hover:bg-fg/5">Cancel</a>
                        <button className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium">Create
                            Character
                        </button>
                    </div>
                </form>
            </Card>
        </main>
    );
}
