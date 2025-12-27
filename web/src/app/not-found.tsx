export default function NotFound() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
            <h1 className="text-2xl font-extrabold">Page not found</h1>
            <p className="text-fg/70 mt-2">
                The page you are looking for doesn’t exist.
            </p>
            <a
                href="/"
                className="bg-brand mt-6 inline-block rounded-md px-4 py-2 font-medium text-white hover:brightness-110"
            >
                Go home
            </a>
        </main>
    );
}
