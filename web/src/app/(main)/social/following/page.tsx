import {apiFetch} from '@/lib/api';

type Row = {
    id: string;
    user: { id: string; name?: string | null; username?: string | null };
};

async function getFollowing(): Promise<Row[]> {
    const res = await apiFetch('/social/following', {cache: 'no-store' as any});
    if (!res.ok) return [];
    return res.json();
}

export default async function FollowingPage() {
    const rows = await getFollowing();
    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <h1 className="text-2xl font-extrabold">You Follow</h1>
            <ul className="mt-4 grid gap-3">
                {rows.map((r) => (
                    <li key={r.id} className="border-fg/15 rounded-md border p-3">
                        <div className="text-sm">
                            <strong>{r.user.name || r.user.username || r.user.id}</strong>
                        </div>
                    </li>
                ))}
                {rows.length === 0 && (
                    <li className="text-fg/70 text-sm">
                        You are not following anyone yet.
                    </li>
                )}
            </ul>
        </main>
    );
}
