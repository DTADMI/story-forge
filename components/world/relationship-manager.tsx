"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";
import { Trash2, Plus, Search } from "lucide-react";

interface Relationship {
  id: string;
  targetId: string;
  targetName: string;
  type: string;
  description?: string;
}

const RELATIONSHIP_TYPES = [
  "parent",
  "child",
  "sibling",
  "spouse",
  "rival",
  "ally",
  "mentor",
  "student",
  "friend",
  "enemy",
  "lover",
];

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of arr) {
    const k = key(item);
    if (!groups[k]) groups[k] = [];
    groups[k].push(item);
  }
  return groups;
}

export function RelationshipManager({ characterId }: { characterId: string }) {
  const { toast } = useToast();
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("parent");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [charRes, relRes] = await Promise.all([
          fetch("/api/world/characters"),
          fetch(`/api/world/characters/${characterId}`),
        ]);
        if (!cancelled && charRes.ok) {
          const list = await charRes.json();
          setCharacters(list.filter((c: { id: string }) => c.id !== characterId));
        }
        if (!cancelled && relRes.ok) {
          const char = await relRes.json();
          setRelationships((char.metadata?.connections as Relationship[]) || []);
        }
      } catch {
        // noop
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [characterId]);

  async function refreshRelationships() {
    try {
      const res = await fetch(`/api/world/characters/${characterId}`);
      if (res.ok) {
        const char = await res.json();
        setRelationships((char.metadata?.connections as Relationship[]) || []);
      }
    } catch {
      // noop
    }
  }

  async function handleAdd() {
    if (!selectedCharacter) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/world/characters/${characterId}/connections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: selectedCharacter,
          type: selectedType,
          description: description.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to add connection");
      toast({ title: "Relationship added" });
      setSelectedCharacter("");
      setDescription("");
      setShowForm(false);
      refreshRelationships();
    } catch {
      toast({ title: "Failed to add relationship", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(connectionId: string) {
    try {
      const res = await fetch(
        `/api/world/characters/${characterId}/connections?connectionId=${connectionId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Relationship removed" });
      refreshRelationships();
    } catch {
      toast({ title: "Failed to remove relationship", variant: "destructive" });
    }
  }

  const grouped = groupBy(relationships, (r) => r.type);
  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-32 bg-fg/10 animate-pulse rounded" />
        <div className="h-12 bg-fg/5 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Relationships</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1 text-xs text-brand font-medium hover:underline"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      {showForm && (
        <div className="border border-fg/10 rounded-lg p-3 space-y-3 bg-bg">
          <div>
            <label className="block text-xs font-medium mb-1">Search Character</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to search..."
                className="w-full rounded-md border border-fg/20 pl-7 pr-3 py-1.5 text-xs bg-bg"
              />
            </div>
            {search && filteredCharacters.length > 0 && (
              <div className="mt-1 max-h-32 overflow-y-auto border border-fg/10 rounded-md">
                {filteredCharacters.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-fg/5 cursor-pointer text-xs"
                  >
                    <input
                      type="radio"
                      name="character"
                      checked={selectedCharacter === c.id}
                      onChange={() => setSelectedCharacter(c.id)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-md border border-fg/20 px-2 py-1.5 text-xs bg-bg"
              >
                {RELATIONSHIP_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Note (optional)</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-fg/20 px-2 py-1.5 text-xs bg-bg"
                placeholder="e.g. Twin sister"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1 text-xs border border-fg/20 rounded-md hover:bg-fg/5"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!selectedCharacter || saving}
              className="px-3 py-1 text-xs bg-brand text-white rounded-md disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Relationship"}
            </button>
          </div>
        </div>
      )}

      {relationships.length === 0 ? (
        <p className="text-xs text-fg/40">No relationships yet.</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([type, rels]) => (
            <div key={type}>
              <span className="text-[10px] font-semibold uppercase text-fg/40 tracking-wide">
                {type}
              </span>
              <ul className="mt-1 space-y-1">
                {rels.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-fg/5"
                  >
                    <div>
                      <span className="font-medium">{r.targetName}</span>
                      {r.description && <span className="text-fg/40 ml-2">{r.description}</span>}
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-fg/30 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
