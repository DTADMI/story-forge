"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

const entityConfig: Record<
  string,
  {
    label: string;
    href: (id: string, data: any) => string;
    excerpt: (data: any) => string;
    icon: string;
  }
> = {
  characters: {
    label: "Characters",
    href: (id) => `/world/characters/${id}`,
    excerpt: (d) => d.bio || "",
    icon: "C",
  },
  locations: {
    label: "Locations",
    href: (id) => `/world/locations/${id}`,
    excerpt: (d) => d.description || "",
    icon: "L",
  },
  timeline: {
    label: "Timeline Events",
    href: (id) => `/world/timeline/${id}`,
    excerpt: (d) => d.description || "",
    icon: "T",
  },
  encyclopedia: {
    label: "Encyclopedia",
    href: (id, d) => `/world/encyclopedia/${d.category || "research"}/${id}`,
    excerpt: (d) => d.content || "",
    icon: "E",
  },
  organizations: {
    label: "Organizations",
    href: (id) => `/world/organizations/${id}`,
    excerpt: (d) => d.description || "",
    icon: "O",
  },
  species: {
    label: "Species",
    href: (id) => `/world/species/${id}`,
    excerpt: (d) => d.description || "",
    icon: "S",
  },
};

export default function WorldSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults({});
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/world/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || {});
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <h1 className="text-2xl font-extrabold">Search World</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-fg/30" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search characters, locations, timeline, encyclopedia..."
          className="w-full rounded-md border border-fg/20 pl-10 pr-4 py-3 text-sm bg-bg"
          autoFocus
        />
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-fg/5 animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {!loading && query && totalResults === 0 && (
        <Card className="p-8 text-center">
          <p className="text-fg/40">No results found for &quot;{query}&quot;</p>
        </Card>
      )}

      {Object.entries(results).map(([type, items]) => {
        const cfg = entityConfig[type];
        if (!cfg) return null;

        return (
          <div key={type}>
            <h2 className="text-sm font-semibold text-fg/50 uppercase tracking-wide mb-2">
              {cfg.label} ({items.length})
            </h2>
            <div className="space-y-2">
              {items.map((item: any) => (
                <Card
                  key={item.id}
                  className="p-3 cursor-pointer hover:bg-fg/5 transition-colors"
                  onClick={() => router.push(cfg.href(item.id, item))}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-xs font-bold text-brand shrink-0">
                      {cfg.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{item.title || item.name}</h3>
                      {cfg.excerpt(item) && (
                        <p className="text-xs text-fg/40 mt-0.5 line-clamp-2">
                          {cfg.excerpt(item)}
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
