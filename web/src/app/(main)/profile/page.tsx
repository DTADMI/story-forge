import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {apiFetch} from '@/lib/api';
import {redirect} from 'next/navigation';

async function getUser(id: string) {
    const res = await apiFetch(`/users/${encodeURIComponent(id)}`, {cache: 'no-store' as any});
    if (!res.ok) return null;
    return res.json();
}

async function getWallet(userId: string) {
    const res = await apiFetch('/gamification/wallet', {cache: 'no-store' as any});
    if (!res.ok) return null;
    return res.json();
}

async function setGoal(userId: string, formData: FormData) {
    'use server';
    const target = Number(String(formData.get('dailyGoal') || '0'));
    if (!Number.isFinite(target) || target <= 0) return;
    await apiFetch('/gamification/goals', {
        method: 'POST',
        body: JSON.stringify({target})
    });
}

async function getStreak(userId: string) {
    const res = await apiFetch('/gamification/streak', {cache: 'no-store' as any});
    if (!res.ok) return {streak: 0};
    return res.json();
}

async function updateUser(userId: string, formData: FormData) {
    'use server';
    const payload = {
        name: String(formData.get('name') || '').trim() || null,
        username: String(formData.get('username') || '').trim() || null,
        bio: String(formData.get('bio') || '').trim() || null,
        website: String(formData.get('website') || '').trim() || null,
        defaultPublicationScope: String(formData.get('defaultPublicationScope') || '') || undefined
    };
    await apiFetch(`/users/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });
}

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) redirect('/signin');
    const [user, wallet, streak] = await Promise.all([getUser(userId), getWallet(userId), getStreak(userId)]);

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
                <div>
                    <label className="block text-sm font-medium">Default publication scope</label>
                    <select
                        name="defaultPublicationScope"
                        defaultValue={
                            (user?.settings?.defaultPublicationScope as string | undefined) ?? 'private'
                        }
                        className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm"
                    >
                        <option value="private">private</option>
                        <option value="friends">friends</option>
                        <option value="public-auth">public-auth</option>
                        <option value="public-anyone">public-anyone</option>
                    </select>
                </div>
                <div className="flex items-center justify-between">
                    <button className="rounded-md bg-brand px-4 py-2 text-white">Save</button>
                    {wallet?.balance != null && (
                        <span className="text-sm">Gems: <strong>{wallet.balance}</strong></span>
                    )}
                </div>
            </form>

            <form action={setGoal.bind(null, userId)} className="mt-6 grid gap-3 rounded-lg border border-fg/15 p-4">
                <h2 className="text-lg font-bold">Goals</h2>
                <div>
                    <label className="block text-sm font-medium">Daily goal (words)</label>
                    <input name="dailyGoal" type="number" min={1} step={1}
                           placeholder="e.g., 500"
                           className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm"/>
                </div>
                <div className="flex items-center justify-between">
                    <button className="rounded-md bg-brand px-4 py-2 text-white">Save Goal</button>
                    <span className="text-sm">Current streak: <strong>{streak?.streak ?? 0}</strong> days</span>
                </div>
            </form>
        </main>
    );
}
