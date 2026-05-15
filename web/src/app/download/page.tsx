import Link from "next/link";

export default function DownloadPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-semibold text-slate-100">Install StoryForge</h1>
        <p className="mt-2 text-sm text-slate-300">
          StoryForge can run as an installable web app. Install to your home screen for faster
          startup and better continuity when connectivity is unstable.
        </p>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
        <h2 className="text-lg font-semibold text-slate-100">iOS Safari</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-300">
          <li>Open StoryForge in Safari.</li>
          <li>Tap Share.</li>
          <li>Select Add to Home Screen.</li>
          <li>Launch StoryForge from your home screen.</li>
        </ol>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
        <h2 className="text-lg font-semibold text-slate-100">Android / Chromium</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-300">
          <li>Open StoryForge in your browser.</li>
          <li>Use Install app from browser menu or the in-app prompt.</li>
          <li>Confirm and launch from the app icon.</li>
        </ol>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
        <h2 className="text-lg font-semibold text-slate-100">Offline fallback</h2>
        <p className="mt-2 text-sm text-slate-300">
          If the app cannot reach the network, StoryForge serves an offline page and resumes
          normally when connectivity returns.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white"
            href="/"
          >
            Back home
          </Link>
          <Link
            className="rounded-md border border-slate-500 px-4 py-2 text-sm font-medium text-slate-200"
            href="/offline"
          >
            Open offline page
          </Link>
        </div>
      </section>
    </main>
  );
}
