export default function FaqPage() {
    return (
        <main className="prose-lite mx-auto max-w-3xl px-6 py-10">
            <h1>Frequently Asked Questions</h1>
            <h2>Is StoryForge free?</h2>
            <p>
                Yes, there is a free tier. Premium unlocks advanced tools and unlimited
                projects.
            </p>
            <h2>Do I need an account to browse?</h2>
            <p>
                No. You can view marketing pages and the public feed without signing in.
            </p>
            <h2>How does privacy work?</h2>
            <p>
                Each project has a default scope, and items can override visibility:
                private, friends, public-auth, public-anyone.
            </p>
        </main>
    );
}
