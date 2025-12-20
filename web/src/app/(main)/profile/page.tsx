import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {redirect} from 'next/navigation';

async function getUser(id: string) {
    const api = process.env.API_URL;
    if (!api) return null;
    const res = await fetch(`${api}/users/${encodeURIComponent(id)}`, {cache: 'no-store'});
    if (!res.ok) return null;
    return res.json();
}

async function getWallet(userId: string) {
    const api = process.env.API_URL;
    if (!api) return null;
    const res = await fetch(`${api}/gamification/wallet?userId=${encodeURIComponent(userId)}`, {cache: 'no-store'});
    if (!res.ok) return null;
    return res.json();
}

async function updateUser(userId: string, formData: FormData) {
    'use server';
    const api = process.env.API_URL!;
    const payload = {
        name: String(formData.get('name') || '').trim() || null,
        username: String(formData.get('username') || '').trim() || null,
        bio: String(formData.get('bio') || '').trim() || null,
        website: String(formData.get('website') || '').trim() || null
    };
    await fetch(`${api}/users/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
}

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) redirect('/signin');
    const [user, wallet] = await Promise.all([getUser(userId), getWallet(userId)]);

    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <h1 className="text-2xl font-extrabold">Your Profile</h1>
            <form action={updateUser.bind(null, userId)} className="mt-6 grid gap-3 rounded-lg border border-fg/15 p-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input name="name" defaultValue={user?.name ?? ''}
                           className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Username</label>
                    <input name="username" defaultValue={user?.username ?? ''}
                           className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Website</label>
                    <input name="website" defaultValue={user?.website ?? ''}
                           className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Bio</label>
                    <textarea name="bio" defaultValue={user?.bio ?? ''}
                              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm"/>
                </div>
                <div className="flex items-center justify-between">
                    <button className="rounded-md bg-brand px-4 py-2 text-white">Save</button>
                    {wallet?.balance != null && (
                        <span className="text-sm">Gems: <strong>{wallet.balance}</strong></span>
                    )}
                </div>
            </form>
        </main>
    );
}
