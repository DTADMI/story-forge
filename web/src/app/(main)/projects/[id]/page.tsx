import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';

type Project = {
    id: string;
    title: string;
    description?: string;
    defaultScope: 'private' | 'friends' | 'public-auth' | 'public-anyone'
};

async function getProject(id: string): Promise<Project | null> {
    const api = process.env.API_URL;
    if (!api) return null;
    const res = await fetch(`${api}/projects/${id}`, {cache: 'no-store'});
    if (!res.ok) return null;
    return res.json();
}

async function updateProject(id: string, formData: FormData) {
    'use server';
    const api = process.env.API_URL!;
    const title = String(formData.get('title') || '').trim() || undefined;
    const description = String(formData.get('description') || '').trim() || undefined;
    const defaultScope = (String(formData.get('defaultScope') || '') || undefined) as Project['defaultScope'] | undefined;
    await fetch(`${api}/projects/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title, description, defaultScope})
    });
}

export default async function ProjectDetailPage({params}: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return null;
    const project = await getProject(params.id);
    if (!project) {
        return (
            <main className="mx-auto max-w-3xl px-6 py-10">
                <h1 className="text-2xl font-extrabold">Project not found</h1>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <h1 className="text-2xl font-extrabold">{project.title}</h1>
            <form action={updateProject.bind(null, project.id)} className="mt-6 grid gap-3">
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input name="title" defaultValue={project.title}
                           className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea name="description" defaultValue={project.description || ''}
                              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Default scope</label>
                    <select name="defaultScope" defaultValue={project.defaultScope}
                            className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm">
                        <option value="private">private</option>
                        <option value="friends">friends</option>
                        <option value="public-auth">public-auth</option>
                        <option value="public-anyone">public-anyone</option>
                    </select>
                </div>
                <div>
                    <button className="rounded-md bg-brand px-4 py-2 text-white">Save changes</button>
                </div>
            </form>
        </main>
    );
}
