"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/toast";
import { getErrorMessage } from "@/lib/client-api";
import { useApiMutation } from "@/lib/query-hooks";

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
  const [spells, setSpells] = useState<string[]>([]);
  const [newSpell, setNewSpell] = useState("");
  const createMagicMutation = useApiMutation<unknown, Record<string, unknown>>(
    "/api/world/encyclopedia",
    {
      onSuccess: () => {
        toast({ title: "Magic system created." });
        onSaved?.();
      },
      onError: (error) => {
        toast({
          title: "Failed to save magic system",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      },
    }
  );

  function addSpell() {
    if (!newSpell.trim()) return;
    setSpells((current) => [...current, newSpell.trim()]);
    setNewSpell("");
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">System Name</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. The Weave"
          className="w-full rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Type</label>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="w-full rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
        >
          <option value="elemental">Elemental</option>
          <option value="arcane">Arcane</option>
          <option value="divine">Divine</option>
          <option value="ritual">Ritual</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Source</label>
        <textarea
          value={source}
          onChange={(event) => setSource(event.target.value)}
          rows={2}
          className="w-full resize-y rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          placeholder="Where does magic come from?"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Costs &amp; Limitations</label>
        <textarea
          value={costsAndLimitations}
          onChange={(event) => setCostsAndLimitations(event.target.value)}
          rows={2}
          className="w-full resize-y rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          placeholder="What are the costs and limits of using magic?"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Schools / Components</label>
        <textarea
          value={schoolsComponents}
          onChange={(event) => setSchoolsComponents(event.target.value)}
          rows={2}
          className="w-full resize-y rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          placeholder="Verbal, somatic, material components or schools of magic"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Spells</label>
        <div className="mb-2 flex items-center gap-2">
          <input
            value={newSpell}
            onChange={(event) => setNewSpell(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addSpell())}
            placeholder="Add a spell..."
            className="flex-1 rounded-md border border-fg/20 bg-bg px-3 py-1.5 text-sm"
          />
          <button
            onClick={addSpell}
            className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand/90"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        {spells.length === 0 ? (
          <p className="text-xs text-fg/40">No spells added yet.</p>
        ) : (
          <ul className="space-y-1">
            {spells.map((spell, index) => (
              <li
                key={`${spell}-${index}`}
                className="flex items-center justify-between rounded px-2 py-1 text-xs hover:bg-fg/5"
              >
                <span>{spell}</span>
                <button
                  onClick={() => setSpells((current) => current.filter((_, i) => i !== index))}
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
          onClick={async () => {
            if (!name.trim()) {
              toast({ title: "Name is required", variant: "destructive" });
              return;
            }

            await createMagicMutation.mutateAsync({
              category: "magic",
              title: name.trim(),
              content: `**Type:** ${type}\n**Source:** ${source || "N/A"}\n**Costs & Limitations:** ${costsAndLimitations || "N/A"}\n**Schools/Components:** ${schoolsComponents || "N/A"}\n**Spells:** ${spells.join(", ") || "None"}`,
              metadata: {
                type,
                source: source.trim(),
                costsAndLimitations: costsAndLimitations.trim(),
                schoolsComponents: schoolsComponents.trim(),
                spells,
              },
            });
          }}
          disabled={createMagicMutation.isPending}
          className="rounded-md bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
        >
          {createMagicMutation.isPending ? "Saving..." : "Create Magic System"}
        </button>
      </div>
    </div>
  );
}
