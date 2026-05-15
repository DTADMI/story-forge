"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface Entity {
  id: string;
  name: string;
}

interface EntitySelectorProps {
  entityType: "character" | "location";
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function EntitySelector({ entityType, selected, onChange }: EntitySelectorProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/world/${entityType}s`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setEntities(data);
        }
      } catch {
        // noop
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [entityType]);

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  const filtered = entities.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const label = entityType === "character" ? "Characters" : "Locations";
  const colorClass = entityType === "character" ? "bg-brand/10 text-brand" : "bg-fg/5 text-fg/60";

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative mb-2">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Filter ${entityType}s...`}
          className="w-full rounded-md border border-fg/20 pl-7 pr-3 py-1.5 text-xs bg-bg"
        />
      </div>

      {loading ? (
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-fg/5 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="max-h-36 overflow-y-auto border border-fg/10 rounded-md">
          {filtered.length === 0 ? (
            <p className="text-xs text-fg/40 px-3 py-2">No {entityType}s found</p>
          ) : (
            filtered.map((e) => (
              <label
                key={e.id}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-fg/5 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(e.id)}
                  onChange={() => toggle(e.id)}
                  className="rounded"
                />
                {e.name}
              </label>
            ))
          )}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selected.map((id) => {
            const entity = entities.find((e) => e.id === id);
            return entity ? (
              <span
                key={id}
                className={`text-xs px-2 py-0.5 rounded-full cursor-pointer ${colorClass}`}
                onClick={() => toggle(id)}
                title="Click to remove"
              >
                {entity.name} ×
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
