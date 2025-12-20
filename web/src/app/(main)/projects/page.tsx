export const dynamic = 'force-static';

export default async function ProjectsPage() {
    // Placeholder UI for projects area (will be wired to API later)
    const sample = [
        {id: 'p1', title: 'Sample Project', description: 'A placeholder project', defaultScope: 'private'}
    ];

    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <header className="mb-6">
                <h1 className="text-2xl font-extrabold">Your Projects</h1>
                <p className="text-[color:var(--fg)]/70">Manage your writing projects and their privacy scopes.</p>
            </header>

            <div className="mb-4">
                <a
                    href="#"
                    className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 font-medium text-white hover:brightness-110"
                    aria-disabled
                >
                    Create Project (coming soon)
                </a>
            </div>

            <ul className="grid gap-4">
                {sample.map((p) => (
                    <li key={p.id} className="rounded-lg border border-[color:var(--fg)]/15 p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">{p.title}</h2>
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
