import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {apiFetch} from '@/lib/api';
import {notFound, redirect} from 'next/navigation';
import {FollowButton} from '@/components/social/follow-button';
import {CheerButton} from '@/components/social/cheer-button';
import {Card} from '@/components/ui/card';
import Link from 'next/link';

async function getUser(id: string) {
    const res = await apiFetch(`/users/${encodeURIComponent(id)}`, {
        cache: 'no-store' as any,
    });
    if (!res.ok) return null;
    return res.json();
}

async function isFollowing(targetId: string) {
    const res = await apiFetch('/social/following', {cache: 'no-store' as any});
    if (!res.ok) return false;
    const following = await res.json();
    return following.some((f: any) => f.user.id === targetId);
}

async function getUserProjects(userId: string) {
    const res = await apiFetch(`/projects?userId=${encodeURIComponent(userId)}`, {cache: 'no-store' as any});
    if (!res.ok) return [];
    return res.json();
}

export default async function UserProfilePage({
                                                  params,
                                              }: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id as string | undefined;
    if (!currentUserId) redirect('/signin');

    // If viewing own profile, redirect to /profile
    if (currentUserId === params.id) redirect('/profile');

    const [user, projects] = await Promise.all([
        getUser(params.id),
        getUserProjects(params.id)
    ]);
    if (!user) notFound();

    const initialFollowing = await isFollowing(params.id);

    return (
        <main className="mx-auto max-w-3xl px-6 py-10 space-y-10">
            <Card className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold">
                            {user.name || 'Anonymous User'}
                        </h1>
                        <p className="text-fg/60">@{user.username || 'user'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheerButton targetUserId={user.id}/>
                        <FollowButton
                            targetUserId={user.id}
                            initialIsFollowing={initialFollowing}
                        />
                    </div>
                </div>

                {user.bio && (
                    <div className="mt-6">
                        <h2 className="text-fg/40 text-sm font-bold tracking-wider uppercase">
                            Bio
                        </h2>
                        <p className="mt-1">{user.bio}</p>
                    </div>
                )}

                {user.website && (
                    <div className="mt-4">
                        <a
                            href={user.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand hover:underline"
                        >
                            {user.website}
                        </a>
                    </div>
                )}

                <div className="border-fg/10 mt-8 grid grid-cols-2 gap-4 border-t pt-6">
                    <div>
                        <p className="text-fg/40 text-xs font-bold uppercase">Status</p>
                        <p className="text-sm font-medium">
                            {user.subscriptionStatus === 'active'
                                ? 'Premium Member'
                                : 'Member'}
                        </p>
                    </div>
                    <div>
                        <p className="text-fg/40 text-xs font-bold uppercase">Joined</p>
                        <p className="text-sm font-medium">
                            {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </Card>

            <section>
                <h2 className="text-xl font-bold mb-4">Public Projects</h2>
                {projects.length === 0 ? (
                    <p className="text-fg/50 text-sm">No public projects to show.</p>
                ) : (
                    <div className="grid gap-4">
                        {projects.map((p: any) => (
                            <Link key={p.id} href={`/projects/${p.id}`}>
                                <Card className="p-4 hover:border-brand transition-colors">
                                    <h3 className="font-bold">{p.title}</h3>
                                    {p.description && <p className="text-sm text-fg/60 mt-1">{p.description}</p>}
                                    <div className="mt-2 text-xs font-medium text-brand uppercase tracking-wider">
                                        {p.defaultScope}
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
