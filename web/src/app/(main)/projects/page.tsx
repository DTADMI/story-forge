import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import Link from 'next/link';

type Project = {
    id: string;
    title: string;
    description?: string;
    defaultScope: 'private' | 'friends' | 'public-auth' | 'public-anyone'
};

async function getProjects(userId: string): Promise<Project[]> {
    const api = process.env.API_URL;
    if (!api) return [];
    const res = await fetch(`${api}/projects?userId=${encodeURIComponent(userId)}`, {cache: 'no-store'});
    if (!res.ok) return [];
    return res.json();
}

async function createProject(userId: string, formData: FormData) {
    'use server';
    const api = process.env.API_URL!;
    const title = String(formData.get('title') || '').trim();
    const description = String(formData.get('description') || '').trim() || undefined;
    const defaultScope = (String(formData.get('defaultScope') || 'private') as Project['defaultScope']);
    if (!title) return;
    await fetch(`${api}/projects`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userId, title, description, defaultScope})
    });
}

export default async function ProjectsPage() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    const projects = userId ? await getProjects(userId) : [];

    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <header className="mb-6">
                <h1 className="text-2xl font-extrabold">Your Projects</h1>
                <p className="text-[color:var(--fg)]/70">Manage your writing projects and their privacy scopes.</p>
            </header>

            {userId && (
                <form action={createProject.bind(null, userId)}
                      className="mb-6 grid gap-3 rounded-lg border border-fg/15 p-4">
                    <div>
                        <label className="block text-sm font-medium">Title</label>
                        <input name="title" required
                               className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Description</label>
                        <textarea name="description"
                                  className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Default scope</label>
                        <select name="defaultScope"
                                className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm">
                            <option value="private">private</option>
                            <option value="friends">friends</option>
                            <option value="public-auth">public-auth</option>
                            <option value="public-anyone">public-anyone</option>
                        </select>
                    </div>
                    <div>
                        <button className="rounded-md bg-brand px-4 py-2 text-white">Create Project</button>
                    </div>
                </form>
            )}

            <ul className="grid gap-4">
                {projects.map((p) => (
                    <li key={p.id} className="rounded-lg border border-[color:var(--fg)]/15 p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">
                                <Link className="hover:underline" href={`/projects/${p.id}`}>{p.title}</Link>
                            </h2>
                            <span
                                className="text-xs uppercase tracking-wide text-[color:var(--fg)]/50">{p.defaultScope}</span>
                        </div>
                        {p.description && <p className="mt-2 text-sm">{p.description}</p>}
                    </li>
                ))}
            </ul>
        </main>
    );
}
