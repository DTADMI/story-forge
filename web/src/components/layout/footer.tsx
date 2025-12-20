import Link from 'next/link';

export function Footer() {
    return (
        <footer className="mt-16 border-t border-fg/10">
            <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-fg/70">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p>&copy; {new Date().getFullYear()} StoryForge. All rights reserved.</p>
                    <nav className="flex gap-4">
                        <Link href="/about" className="hover:underline">About</Link>
                        <Link href="/faq" className="hover:underline">FAQ</Link>
                        <Link href="/pricing" className="hover:underline">Pricing</Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
