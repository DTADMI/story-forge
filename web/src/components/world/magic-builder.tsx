"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";
import { Plus, Trash2 } from "lucide-react";

interface Spell {
  name: string;
}

interface MagicBuilderProps {
  onSaved?: () => void;
}

export function MagicBuilder({ onSaved }: MagicBuilderProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [type, setType] = useState("arcane");
  const [source, setSource] = useState("");
  const [costsAndLimitations, setCostsAndLimitations] = useState("");
  const [schoolsComponents, setSchoolsComponents] = useState("");
  const [spells, setSpells] = useState<Spell[]>([]);
  const [newSpell, setNewSpell] = useState("");
  const [saving, setSaving] = useState(false);

  function addSpell() {
    if (!newSpell.trim()) return;
    setSpells((prev) => [...prev, { name: newSpell.trim() }]);
    setNewSpell("");
  }

  function removeSpell(index: number) {
    setSpells((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const structuredContent = {
        type,
        source: source.trim(),
        costsAndLimitations: costsAndLimitations.trim(),
        schoolsComponents: schoolsComponents.trim(),
        spells: spells.map((s) => s.name),
      };
      const content = `**Type:** ${type}\n**Source:** ${source || "N/A"}\n**Costs & Limitations:** ${costsAndLimitations || "N/A"}\n**Schools/Components:** ${schoolsComponents || "N/A"}\n**Spells:** ${spells.map((s) => s.name).join(", ") || "None"}`;

      const res = await fetch("/api/world/encyclopedia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "magic",
          title: name.trim(),
          content,
          metadata: structuredContent,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Magic system created!" });
      onSaved?.();
    } catch {
      toast({ title: "Failed to save magic system", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">System Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. The Weave"
          className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
        >
          <option value="elemental">Elemental</option>
          <option value="arcane">Arcane</option>
          <option value="divine">Divine</option>
          <option value="ritual">Ritual</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Source</label>
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
          placeholder="Where does magic come from?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Costs &amp; Limitations</label>
        <textarea
          value={costsAndLimitations}
          onChange={(e) => setCostsAndLimitations(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
          placeholder="What are the costs and limits of using magic?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Schools / Components</label>
        <textarea
          value={schoolsComponents}
          onChange={(e) => setSchoolsComponents(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
          placeholder="Verbal, somatic, material components or schools of magic"
        />
      </div>

      {/* Spells List */}
      <div>
        <label className="block text-sm font-medium mb-1">Spells</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            value={newSpell}
            onChange={(e) => setNewSpell(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpell())}
            placeholder="Add a spell..."
            className="flex-1 rounded-md border border-fg/20 px-3 py-1.5 text-sm bg-bg"
          />
          <button
            onClick={addSpell}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-brand text-white rounded-md hover:bg-brand/90"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        {spells.length === 0 ? (
          <p className="text-xs text-fg/40">No spells added yet.</p>
        ) : (
          <ul className="space-y-1">
            {spells.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-fg/5"
              >
                <span>{s.name}</span>
                <button
                  onClick={() => removeSpell(i)}
                  className="text-fg/30 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-brand/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Create Magic System"}
        </button>
      </div>
    </div>
  );
}
