"use client";

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/toast";
import { ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react";

interface Character {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

interface Panel {
  number: number;
  description: string;
  characterId: string;
  locationId: string;
}

interface StoryboardProps {
  projectId: string;
  initialPanels: Panel[];
  characters: Character[];
  locations: Location[];
}

export function Storyboard({ projectId, initialPanels, characters, locations }: StoryboardProps) {
  const [panels, setPanels] = useState<Panel[]>(initialPanels);
  const [saving, setSaving] = useState(false);
  const [linkedCharIds, setLinkedCharIds] = useState<string[]>([]);
  const [linkedLocIds, setLinkedLocIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((proj) => {
        setLinkedCharIds(proj.settings?.linkedEntities?.characters || []);
        setLinkedLocIds(proj.settings?.linkedEntities?.locations || []);
      })
      .catch(() => {});
  }, [projectId]);

  const linkedChars = characters.filter((c) => linkedCharIds.includes(c.id));
  const linkedLocs = locations.filter((l) => linkedLocIds.includes(l.id));

  const savePanels = useCallback(
    async (updated: Panel[]) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            settings: { storyboard: { panels: updated } },
          }),
        });
        if (!res.ok) throw new Error("Failed to save");
      } catch {
        toast({
          title: "Failed to save storyboard",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    },
    [projectId, toast]
  );

  const addPanel = useCallback(() => {
    const nextNumber = panels.length + 1;
    const updated = [
      ...panels,
      { number: nextNumber, description: "", characterId: "", locationId: "" },
    ];
    setPanels(updated);
    savePanels(updated);
  }, [panels, savePanels]);

  const removePanel = useCallback(
    (index: number) => {
      const updated = panels.filter((_, i) => i !== index).map((p, i) => ({ ...p, number: i + 1 }));
      setPanels(updated);
      savePanels(updated);
    },
    [panels, savePanels]
  );

  const movePanel = useCallback(
    (index: number, direction: "up" | "down") => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= panels.length) return;
      const updated = [...panels];
      [updated[index], updated[target]] = [updated[target], updated[index]];
      const renumbered = updated.map((p, i) => ({ ...p, number: i + 1 }));
      setPanels(renumbered);
      savePanels(renumbered);
    },
    [panels, savePanels]
  );

  const updatePanel = useCallback(
    (index: number, field: keyof Panel, value: string) => {
      const updated = panels.map((p, i) => (i === index ? { ...p, [field]: value } : p));
      setPanels(updated);
    },
    [panels]
  );

  const handleBlur = useCallback(() => {
    savePanels(panels);
  }, [panels, savePanels]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Storyboard Panels</h2>
        <div className="flex items-center gap-2">
          {(linkedChars.length > 0 || linkedLocs.length > 0) && (
            <span className="text-[10px] text-fg/40">
              {linkedChars.length} Linked | {linkedLocs.length} Linked
            </span>
          )}
          <button
            onClick={addPanel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-brand text-white rounded-md hover:bg-brand/90"
          >
            <Plus className="h-4 w-4" />
            Add Panel
          </button>
        </div>
      </div>

      {panels.length === 0 ? (
        <div className="text-center py-10 text-fg/40">
          <p className="text-sm">No panels yet. Click &quot;Add Panel&quot; to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {panels.map((panel, index) => (
            <div key={index} className="border border-fg/10 rounded-lg p-4 bg-bg space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-fg/50 w-6">#{panel.number}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => movePanel(index, "up")}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-fg/5 disabled:opacity-30"
                    aria-label="Move panel up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => movePanel(index, "down")}
                    disabled={index === panels.length - 1}
                    className="p-1 rounded hover:bg-fg/5 disabled:opacity-30"
                    aria-label="Move panel down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex-1" />
                <button
                  onClick={() => removePanel(index)}
                  className="p-1 rounded hover:bg-red-500/10 text-fg/40 hover:text-red-500"
                  aria-label="Remove panel"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <textarea
                value={panel.description}
                onChange={(e) => updatePanel(index, "description", e.target.value)}
                onBlur={handleBlur}
                placeholder="Panel description..."
                className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y min-h-[60px]"
                rows={2}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-fg/50 mb-1">Character</label>
                  <select
                    value={panel.characterId}
                    onChange={(e) => updatePanel(index, "characterId", e.target.value)}
                    onBlur={handleBlur}
                    className="w-full rounded-md border border-fg/20 px-2 py-1.5 text-sm bg-bg"
                  >
                    <option value="">None</option>
                    {linkedChars.length > 0 && (
                      <optgroup label="Linked Characters">
                        {linkedChars.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {characters
                      .filter((c) => !linkedCharIds.includes(c.id))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg/50 mb-1">Location</label>
                  <select
                    value={panel.locationId}
                    onChange={(e) => updatePanel(index, "locationId", e.target.value)}
                    onBlur={handleBlur}
                    className="w-full rounded-md border border-fg/20 px-2 py-1.5 text-sm bg-bg"
                  >
                    <option value="">None</option>
                    {linkedLocs.length > 0 && (
                      <optgroup label="Linked Locations">
                        {linkedLocs.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {locations
                      .filter((l) => !linkedLocIds.includes(l.id))
                      .map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {saving && <p className="text-xs text-fg/40 text-right">Saving...</p>}
    </div>
  );
}
