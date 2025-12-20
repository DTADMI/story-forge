export default function NotFound() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
            <h1 className="text-2xl font-extrabold">Page not found</h1>
            <p className="mt-2 text-fg/70">The page you are looking for doesn’t exist.</p>
            <a href="/"
               className="mt-6 inline-block rounded-md bg-brand px-4 py-2 font-medium text-white hover:brightness-110">
                Go home
            </a>
        </main>
    );
}
