'use client';
import {useEffect, useState} from 'react';

const STORAGE_KEY = 'sf-theme';

function getPreferredTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | null;
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

export function DarkModeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>(getPreferredTheme());

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    return (
        <button
            type="button"
            aria-label="Toggle dark mode"
            className="border-fg/20 hover:bg-fg/5 inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        >
            {theme === 'dark' ? (
                <>
                    <span aria-hidden>🌙</span>
                    <span>Dark</span>
                </>
            ) : (
                <>
                    <span aria-hidden>☀️</span>
                    <span>Light</span>
                </>
            )}
        </button>
    );
}
