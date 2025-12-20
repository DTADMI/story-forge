import Link from 'next/link';
import {DarkModeToggle} from '@/components/dark-mode-toggle';

export function Header() {
    return (
        <header className="sticky top-0 z-40 border-b border-fg/10 bg-bg/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-lg font-extrabold text-brand">
                        StoryForge
                    </Link>
                    <nav className="hidden gap-4 sm:flex text-sm">
                        <Link href="/feed" className="hover:underline">Feed</Link>
                        <Link href="/pricing" className="hover:underline">Pricing</Link>
                        <Link href="/about" className="hover:underline">About</Link>
                        <Link href="/faq" className="hover:underline">FAQ</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <DarkModeToggle/>
                    <Link href="/signin" className="text-sm underline">Sign in</Link>
                </div>
            </div>
        </header>
    );
}
