"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Plus } from "lucide-react";
import { QueryBoundary } from "@/components/query/query-boundary";
import { Card } from "@/components/ui/card";
import { useSuspenseApiQuery } from "@/lib/query-hooks";

interface EncyclopediaEntry {
  id: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown> | null;
}

interface BuilderProps {
  onSaved?: () => void;
}

interface EncyclopediaCategoryPageProps {
  category: string;
  title: string;
  description: string;
  createLabel: string;
  browseHref: string;
  browseLabel: string;
  emptyLabel: string;
  emptyActionLabel: string;
  builderTitle: string;
  builderImport: () => Promise<{ default: React.ComponentType<BuilderProps> }>;
  entryHref: (id: string) => string;
  metadataLabel?: (entry: EncyclopediaEntry) => string | null;
}

function CategoryPageContent({
  category,
  title,
  description,
  createLabel,
  browseHref,
  browseLabel,
  emptyLabel,
  emptyActionLabel,
  builderTitle,
  Builder,
  entryHref,
  metadataLabel,
}: Omit<EncyclopediaCategoryPageProps, "builderImport"> & {
  Builder: React.ComponentType<BuilderProps>;
}) {
  const entriesQuery = useSuspenseApiQuery<EncyclopediaEntry[]>(
    ["world", "encyclopedia", category],
    `/api/world/encyclopedia?category=${encodeURIComponent(category)}`
  );
  const entries = entriesQuery.data;
  const [showBuilder, setShowBuilder] = useState(false);

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand/90"
        >
          <Plus className="h-4 w-4" />
          {createLabel}
        </button>
      </div>

      <Link href={browseHref} className="inline-block text-sm text-fg/40 hover:text-brand">
        {browseLabel}
      </Link>

      {showBuilder && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">{builderTitle}</h2>
            <button
              onClick={() => setShowBuilder(false)}
              className="text-xs text-fg/40 hover:text-fg"
            >
              Cancel
            </button>
          </div>
          <Builder
            onSaved={() => {
              setShowBuilder(false);
              void entriesQuery.refetch();
            }}
          />
        </Card>
      )}

      {entries.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-fg/40">{emptyLabel}</p>
          <button
            onClick={() => setShowBuilder(true)}
            className="mt-2 inline-block text-sm font-medium text-brand hover:underline"
          >
            {emptyActionLabel}
          </button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {entries.map((entry) => {
            const detail = metadataLabel?.(entry);
            return (
              <Link key={entry.id} href={entryHref(entry.id)}>
                <Card className="p-4 transition-colors hover:bg-fg/5">
                  <h3 className="text-base font-bold">{entry.title}</h3>
                  {detail && <span className="text-xs text-fg/40">{detail}</span>}
                  <p className="mt-1 line-clamp-2 text-sm text-fg/50">{entry.content}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

export function EncyclopediaCategoryPage(props: EncyclopediaCategoryPageProps) {
  const Builder = dynamic(props.builderImport, {
    loading: () => <div className="h-48 animate-pulse rounded-lg bg-fg/5" />,
  });

  return (
    <QueryBoundary
      loadingFallback={
        <main className="mx-auto max-w-4xl space-y-3 px-4 py-6 sm:px-6">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-fg/5" />
          ))}
        </main>
      }
      errorTitle={`Unable to load ${props.title.toLowerCase()}`}
    >
      <CategoryPageContent {...props} Builder={Builder} />
    </QueryBoundary>
  );
}
