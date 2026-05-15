"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { MagicBuilder } from "@/components/world/magic-builder";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function MagicPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    fetch("/api/world/encyclopedia?category=magic")
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleSaved() {
    setShowBuilder(false);
    router.refresh();
    setTimeout(() => {
      fetch("/api/world/encyclopedia?category=magic")
        .then((r) => r.json())
        .then(setEntries);
    }, 300);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Magic Systems</h1>
          <p className="text-fg/60 text-sm mt-1">
            Define how magic works in your world.
          </p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-brand text-white rounded-md hover:bg-brand/90"
        >
          <Plus className="h-4 w-4" />
          New Magic System
        </button>
      </div>

      <Link href="/world/encyclopedia/magic" className="text-sm text-fg/40 hover:text-brand inline-block">
        View all magic encyclopedia entries
      </Link>

      {showBuilder && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Create Magic System</h2>
            <button
              onClick={() => setShowBuilder(false)}
              className="text-xs text-fg/40 hover:text-fg"
            >
              Cancel
            </button>
          </div>
          <MagicBuilder onSaved={handleSaved} />
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-fg/5 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-fg/40">No magic systems defined yet.</p>
          <button
            onClick={() => setShowBuilder(true)}
            className="text-sm text-brand font-medium hover:underline mt-2 inline-block"
          >
            Create your first magic system
          </button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {entries.map((entry: any) => (
            <Link
              key={entry.id}
              href={`/world/encyclopedia/magic/${entry.id}`}
            >
              <Card className="p-4 hover:bg-fg/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold">{entry.title}</h3>
                    {entry.metadata?.type && (
                      <span className="text-xs text-fg/40 capitalize">
                        {entry.metadata.type}
                      </span>
                    )}
                    <p className="text-sm text-fg/50 mt-1 line-clamp-2">
                      {entry.content}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
