"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorSurfaceProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
}

export function ErrorSurface({
  error,
  reset,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  homeHref = "/dashboard",
  homeLabel = "Go to Dashboard",
}: ErrorSurfaceProps) {
  useEffect(() => {
    console.error("[error-surface]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-fg/50 mb-6">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-fg/20 rounded-md hover:bg-fg/5"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-brand text-white rounded-md hover:bg-brand/90"
          >
            <Home className="h-4 w-4" />
            {homeLabel}
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 rounded-lg bg-fg/5 p-4 text-left">
            <p className="text-xs text-destructive font-mono">{error.message}</p>
            {error.digest && <p className="text-xs text-fg/40 mt-1">Digest: {error.digest}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
