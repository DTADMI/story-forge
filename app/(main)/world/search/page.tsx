"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/client-api";
import { useApiQuery } from "@/lib/query-hooks";
import { isEnabledSync } from "@/lib/flags";

const entityConfig: Record<
  string,
  {
    label: string;
    href: (id: string, data: Record<string, unknown>) => string;
    excerpt: (data: Record<string, unknown>) => string;
    icon: string;
  }
> = {
  characters: {
    label: "Characters",
    href: (id) => `/world/characters/${id}`,
    excerpt: (data) => String(data.bio ?? ""),
    icon: "C",
  },
  locations: {
    label: "Locations",
    href: (id) => `/world/locations/${id}`,
    excerpt: (data) => String(data.description ?? ""),
    icon: "L",
  },
  timeline: {
    label: "Timeline Events",
    href: (id) => `/world/timeline/${id}`,
    excerpt: (data) => String(data.description ?? ""),
    icon: "T",
  },
  encyclopedia: {
    label: "Encyclopedia",
    href: (id, data) => `/world/encyclopedia/${String(data.category ?? "research")}/${id}`,
    excerpt: (data) => String(data.content ?? ""),
    icon: "E",
  },
  organizations: {
    label: "Organizations",
    href: (id) => `/world/organizations/${id}`,
    excerpt: (data) => String(data.description ?? ""),
    icon: "O",
  },
  species: {
    label: "Species",
    href: (id) => `/world/species/${id}`,
    excerpt: (data) => String(data.description ?? ""),
    icon: "S",
  },
};

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

export default function WorldSearchPage() {
  const searchEnabled = isEnabledSync("search");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const trimmedQuery = debouncedQuery.trim();
  const searchQuery = useApiQuery<{ results?: Record<string, Record<string, unknown>[]> }>(
    ["world", "search", trimmedQuery],
    `/api/world/search?q=${encodeURIComponent(trimmedQuery)}`,
    {
      enabled: trimmedQuery.length > 0,
    }
  );
  const results = useMemo(() => searchQuery.data?.results ?? {}, [searchQuery.data]);
  const totalResults = Object.values(results).reduce((sum, items) => sum + items.length, 0);

  if (!searchEnabled) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-extrabold">Search</h1>
        <p className="text-muted-foreground mt-2">Search is coming soon.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold">Search World</h1>
        <p className="text-sm text-muted-foreground">
          Search characters, locations, timeline entries, and reference lore.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-fg/30" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search characters, locations, timeline, encyclopedia..."
          className="w-full rounded-md border border-fg/20 bg-bg py-3 pr-4 pl-10 text-sm"
          autoFocus
        />
      </div>

      {searchQuery.isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-fg/5" />
          ))}
        </div>
      )}

      {searchQuery.isError && query && (
        <Card className="p-8 text-center">
          <p className="text-fg/40">{getErrorMessage(searchQuery.error)}</p>
        </Card>
      )}

      {!searchQuery.isLoading && !searchQuery.isError && query && totalResults === 0 && (
        <Card className="p-8 text-center">
          <p className="text-fg/40">No results found for &quot;{query}&quot;</p>
        </Card>
      )}

      {Object.entries(results).map(([type, items]) => {
        const config = entityConfig[type];
        if (!config) {
          return null;
        }

        return (
          <div key={type}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg/50">
              {config.label} ({items.length})
            </h2>
            <div className="space-y-2">
              {items.map((item) => (
                <Card
                  key={String(item.id)}
                  className="cursor-pointer p-3 transition-colors hover:bg-fg/5"
                  onClick={() => router.push(config.href(String(item.id), item))}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                      {config.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">
                        {String(item.title ?? item.name ?? "Untitled")}
                      </h3>
                      {config.excerpt(item) && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-fg/40">
                          {config.excerpt(item)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </main>
  );
}
