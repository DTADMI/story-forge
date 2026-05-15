"use client";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span className="text-2xl">⚠</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-fg/50 mb-6">An unexpected error occurred while loading this page.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 text-sm font-medium border border-fg/20 rounded-md hover:bg-fg/5"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-md"
          >
            Go to Dashboard
          </a>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-3 bg-fg/5 rounded text-left">
            <p className="text-xs text-red-600 font-mono">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
