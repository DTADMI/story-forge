"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";
import { Plus, Trash2 } from "lucide-react";

interface Deity {
  name: string;
}

interface ReligionBuilderProps {
  onSaved?: () => void;
}

export function ReligionBuilder({ onSaved }: ReligionBuilderProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [deities, setDeities] = useState<Deity[]>([]);
  const [newDeity, setNewDeity] = useState("");
  const [tenets, setTenets] = useState("");
  const [rituals, setRituals] = useState("");
  const [holyTexts, setHolyTexts] = useState("");
  const [hierarchy, setHierarchy] = useState("");
  const [saving, setSaving] = useState(false);

  function addDeity() {
    if (!newDeity.trim()) return;
    setDeities((prev) => [...prev, { name: newDeity.trim() }]);
    setNewDeity("");
  }

  function removeDeity(index: number) {
    setDeities((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const structuredContent = {
        deities: deities.map((d) => d.name),
        tenets: tenets.trim(),
        rituals: rituals.trim(),
        holyTexts: holyTexts.trim(),
        hierarchy: hierarchy.trim(),
      };
      const content = `**Deities:** ${deities.map((d) => d.name).join(", ") || "None"}\n**Tenets:** ${tenets || "N/A"}\n**Rituals:** ${rituals || "N/A"}\n**Holy Texts:** ${holyTexts || "N/A"}\n**Hierarchy:** ${hierarchy || "N/A"}`;

      const res = await fetch("/api/world/encyclopedia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "religion",
          title: name.trim(),
          content,
          metadata: structuredContent,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Religion created!" });
      onSaved?.();
    } catch {
      toast({ title: "Failed to save religion", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Religion Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. The Church of Light"
          className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Deities</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            value={newDeity}
            onChange={(e) => setNewDeity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDeity())}
            placeholder="Add a deity..."
            className="flex-1 rounded-md border border-fg/20 px-3 py-1.5 text-sm bg-bg"
          />
          <button
            onClick={addDeity}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-brand text-white rounded-md hover:bg-brand/90"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        {deities.length > 0 && (
          <ul className="space-y-1">
            {deities.map((d, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-fg/5"
              >
                <span>{d.name}</span>
                <button
                  onClick={() => removeDeity(i)}
                  className="text-fg/30 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tenets</label>
        <textarea
          value={tenets}
          onChange={(e) => setTenets(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
          placeholder="Core beliefs and tenets..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Rituals</label>
        <textarea
          value={rituals}
          onChange={(e) => setRituals(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
          placeholder="Religious rituals and practices..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Holy Texts</label>
        <textarea
          value={holyTexts}
          onChange={(e) => setHolyTexts(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
          placeholder="Sacred texts and scriptures..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Hierarchy</label>
        <textarea
          value={hierarchy}
          onChange={(e) => setHierarchy(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
          placeholder="Organizational structure and ranks..."
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-brand/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Create Religion"}
        </button>
      </div>
    </div>
  );
}
