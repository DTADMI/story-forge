export default function OfflinePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-semibold text-slate-100">You are offline</h1>
        <p className="mt-2 text-sm text-slate-300">
          StoryForge could not reach the network. Reconnect and refresh to continue reading and
          syncing your latest writing activity.
        </p>
      </section>
    </main>
  );
}
