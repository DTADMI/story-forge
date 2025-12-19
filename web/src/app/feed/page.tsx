type Story = {
    id: string;
    title: string;
    author: string;
    excerpt: string;
    scope: 'public-anyone' | 'public-auth' | 'friends' | 'private';
};

async function getMockStories(): Promise<Story[]> {
    // Placeholder SSR data; will be replaced with real query filtered by scope
    return [
        {
            id: '1',
            title: 'The Ember Crown',
            author: 'Aria K.',
            excerpt: 'In the city of brass, a courier carries a message that could end a dynasty...',
            scope: 'public-anyone'
        },
        {
            id: '2',
            title: 'Whispers Under Glass',
            author: 'J. Rowan',
            excerpt: 'Every terrarium is a world, and some worlds whisper back when no one listens.',
            scope: 'public-anyone'
        }
    ];
}

export default async function PublicFeedPage() {
    const stories = await getMockStories();
    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <header className="mb-6">
                <h1 className="text-2xl font-extrabold">Public Stories Feed</h1>
                <p className="text-[color:var(--fg)]/70">Stories shared with scope: public-anyone</p>
            </header>
            <ul className="grid gap-4">
                {stories.map((s) => (
                    <li key={s.id} className="rounded-lg border border-[color:var(--fg)]/15 p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">{s.title}</h2>
                            <span className="text-xs uppercase tracking-wide text-[color:var(--fg)]/50">{s.scope}</span>
                        </div>
                        <p className="mt-1 text-sm text-[color:var(--fg)]/80">by {s.author}</p>
                        <p className="mt-2 text-sm">{s.excerpt}</p>
                    </li>
                ))}
            </ul>
        </main>
    );
}
