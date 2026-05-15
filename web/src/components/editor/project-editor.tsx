"use client";

import { useEffect, useState, useCallback } from "react";
import { Editor } from "@/components/editor/editor";
import { AiWritingButton } from "@/components/ai/ai-writing";
import { useRouter } from "next/navigation";

interface ProjectEditorProps {
  project: {
    id: string;
    title: string;
    description?: string;
    content?: string;
    defaultScope: string;
    settings?: any;
  };
  userPreferences?: {
    breakReminders?: boolean;
  };
}

export function ProjectEditor({ project, userPreferences }: ProjectEditorProps) {
  const [content, setContent] = useState(project.content || "");
  const [saving, setSaving] = useState(false);
  const [lastBreak, setLastBreak] = useState(Date.now());
  const [showLinkedEntities, setShowLinkedEntities] = useState(false);
  const [characters, setCharacters] = useState<{ id: string; name: string }[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [linkedCharIds, setLinkedCharIds] = useState<string[]>(
    project.settings?.linkedEntities?.characters || []
  );
  const [linkedLocIds, setLinkedLocIds] = useState<string[]>(
    project.settings?.linkedEntities?.locations || []
  );
  const router = useRouter();

  useEffect(() => {
    if (showLinkedEntities) {
      Promise.all([
        fetch("/api/world/characters?projectId=" + project.id).then((r) => r.json()),
        fetch("/api/world/locations?projectId=" + project.id).then((r) => r.json()),
      ])
        .then(([chars, locs]) => {
          setCharacters(chars);
          setLocations(locs);
        })
        .catch(() => {});
    }
  }, [showLinkedEntities, project.id]);

  useEffect(() => {
    if (!userPreferences?.breakReminders) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const minsSinceBreak = (now - lastBreak) / 1000 / 60;
      if (minsSinceBreak >= 45) {
        if (confirm("You have been writing for 45 minutes. Take a short break to stay fresh!")) {
          setLastBreak(now);
        } else {
          setLastBreak(now - 30 * 60 * 1000);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [lastBreak, userPreferences?.breakReminders]);

  async function saveLinkedEntities(updatedChars: string[], updatedLocs: string[]) {
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            ...project.settings,
            linkedEntities: { characters: updatedChars, locations: updatedLocs },
          },
        }),
      });
    } catch {
      // ignore
    }
  }

  function toggleChar(id: string) {
    setLinkedCharIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
      saveLinkedEntities(updated, linkedLocIds);
      return updated;
    });
  }

  function toggleLoc(id: string) {
    setLinkedLocIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id];
      saveLinkedEntities(linkedCharIds, updated);
      return updated;
    });
  }

  const handleSave = async (newContent: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      if (res.ok) {
        // Success
      }
    } catch (err) {
      console.error("Failed to save", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAiSuggestion = useCallback((suggestion: string) => {
    setContent((prev) => prev + "\n\n" + suggestion);
  }, []);

  const lastParagraph = content.split(/\n\n+/).pop() ?? content.slice(-500);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold">{project.title}</h1>
          <AiWritingButton
            context={lastParagraph}
            onSuggestion={handleAiSuggestion}
            feature="suggest"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLinkedEntities(!showLinkedEntities)}
            className="px-3 py-1.5 text-xs border border-fg/20 rounded-md hover:bg-fg/5"
          >
            {showLinkedEntities ? "Hide Linked Entities" : "Linked Entities"}
          </button>
          {saving && <span className="text-sm text-fg/50 animate-pulse">Saving...</span>}
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <Editor content={content} onChange={setContent} onSave={handleSave} />
        </div>

        {showLinkedEntities && (
          <div className="w-56 shrink-0 space-y-4 border-l border-fg/10 pl-4">
            <div>
              <h3 className="text-sm font-bold mb-2">Characters</h3>
              {characters.length === 0 ? (
                <p className="text-xs text-fg/40">No characters in project</p>
              ) : (
                <div className="space-y-1">
                  {characters.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 text-xs cursor-pointer hover:bg-fg/5 px-1 py-0.5 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={linkedCharIds.includes(c.id)}
                        onChange={() => toggleChar(c.id)}
                        className="rounded"
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold mb-2">Locations</h3>
              {locations.length === 0 ? (
                <p className="text-xs text-fg/40">No locations in project</p>
              ) : (
                <div className="space-y-1">
                  {locations.map((l) => (
                    <label
                      key={l.id}
                      className="flex items-center gap-2 text-xs cursor-pointer hover:bg-fg/5 px-1 py-0.5 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={linkedLocIds.includes(l.id)}
                        onChange={() => toggleLoc(l.id)}
                        className="rounded"
                      />
                      {l.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[10px] text-fg/40">
              Linked entities are saved to project settings. Use them to associate scene context with world data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
