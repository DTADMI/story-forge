import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {apiFetch} from '@/lib/api';
import {ProjectEditor} from '@/components/editor/project-editor';
import {redirect} from 'next/navigation';

async function getProject(id: string) {
    const res = await apiFetch(`/projects/${id}`, {cache: 'no-store'});
    if (!res.ok) return null;
    return res.json();
}

async function updateSettings(id: string, formData: FormData) {
    'use server';
    const title = String(formData.get('title') || '').trim() || undefined;
    const description = String(formData.get('description') || '').trim() || undefined;
    const defaultScope = String(formData.get('defaultScope') || '') || undefined;

    await apiFetch(`/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({title, description, defaultScope}),
    });
}

async function getUserPreferences(userId: string) {
    const res = await apiFetch(`/users/${userId}`, {cache: 'no-store'});
    if (!res.ok) return null;
    const user = await res.json();
    return user?.settings?.preferences;
}

export default async function ProjectDetailPage({params}: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!session || !userId) redirect('/signin');

    const [project, userPreferences] = await Promise.all([
        getProject(params.id),
        getUserPreferences(userId)
    ]);

    if (!project) {
        return (
            <main className="mx-auto max-w-4xl px-6 py-10">
                <h1 className="text-2xl font-extrabold">Project not found</h1>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-4xl px-6 py-10">
            <ProjectEditor project={project} userPreferences={userPreferences}/>

            <div className="mt-12 border-t border-fg/10 pt-10">
                <h2 className="text-lg font-bold">Project Settings</h2>
                <form action={updateSettings.bind(null, project.id)} className="mt-4 grid gap-4 max-w-xl">
                    <div>
                        <label className="block text-sm font-medium">Title</label>
                        <input name="title" defaultValue={project.title}
                               className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Description</label>
                        <textarea name="description" defaultValue={project.description || ''}
                                  className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Default visibility</label>
                        <select name="defaultScope" defaultValue={project.defaultScope}
                                className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg">
                            <option value="private">private</option>
                            <option value="friends">friends</option>
                            <option value="public-auth">public-auth</option>
                            <option value="public-anyone">public-anyone</option>
                        </select>
                    </div>
                    <div>
                        <button
                            className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand/90 transition-colors">
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
