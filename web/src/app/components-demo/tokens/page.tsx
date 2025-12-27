export default function TokensDemoPage() {
    const tokens = [
        '--bg',
        '--fg',
        '--brand',
        '--accent',
        '--success',
        '--warning',
        '--info',
        '--ring',
        '--radius-sm',
        '--radius-md',
        '--radius-lg',
        '--text-xs',
        '--text-sm',
        '--text-base',
        '--text-lg',
        '--text-xl',
        '--text-2xl',
    ];
    return (
        <main className="prose-lite mx-auto max-w-3xl px-6 py-10">
            <h1>Design Tokens</h1>
            <p>
                These CSS variables are defined in <code>globals.css</code> and can be
                used across the app.
            </p>
            <ul>
                {tokens.map((t) => (
                    <li key={t} className="flex items-center justify-between">
                        <code>{t}</code>
                        <span
                            style={{background: `var(${t})`}}
                            className="border-fg/10 h-5 w-10 rounded border"
                        ></span>
                    </li>
                ))}
            </ul>
        </main>
    );
}
