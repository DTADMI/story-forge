import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {apiFetch} from '@/lib/api';
import {notFound, redirect} from 'next/navigation';
import {FollowButton} from '@/components/social/follow-button';
import {Card} from '@/components/ui/card';

async function getUser(id: string) {
    const res = await apiFetch(`/users/${encodeURIComponent(id)}`, {cache: 'no-store' as any});
    if (!res.ok) return null;
    return res.json();
}

async function isFollowing(targetId: string) {
    const res = await apiFetch('/social/following', {cache: 'no-store' as any});
    if (!res.ok) return false;
    const following = await res.json();
    return following.some((f: any) => f.user.id === targetId);
}

export default async function UserProfilePage({params}: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id as string | undefined;
    if (!currentUserId) redirect('/signin');

    // If viewing own profile, redirect to /profile
    if (currentUserId === params.id) redirect('/profile');

    const user = await getUser(params.id);
    if (!user) notFound();

    const initialFollowing = await isFollowing(params.id);

    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <Card className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold">{user.name || 'Anonymous User'}</h1>
                        <p className="text-fg/60">@{user.username || 'user'}</p>
                    </div>
                    <FollowButton targetUserId={user.id} initialIsFollowing={initialFollowing}/>
                </div>

                {user.bio && (
                    <div className="mt-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-fg/40">Bio</h2>
                        <p className="mt-1">{user.bio}</p>
                    </div>
                )}

                {user.website && (
                    <div className="mt-4">
                        <a href={user.website} target="_blank" rel="noopener noreferrer"
                           className="text-brand hover:underline">
                            {user.website}
                        </a>
                    </div>
                )}

                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-fg/10 pt-6">
                    <div>
                        <p className="text-xs font-bold uppercase text-fg/40">Status</p>
                        <p className="text-sm font-medium">{user.subscriptionStatus === 'active' ? 'Premium Member' : 'Member'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-fg/40">Joined</p>
                        <p className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </Card>
        </main>
    );
}
