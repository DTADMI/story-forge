"use client";

import { useState } from "react";
import { isEnabledSync } from "@/lib/flags";

interface CharacterSuggestion {
  name: string;
  role: string;
  traits: string[];
  flaws: string[];
  motivations: string[];
  backstory: string;
  arc: string;
  relationships: string[];
}

interface AiCharacterPanelProps {
  context: string;
  projectId?: string;
  className?: string;
}

const featureLabels = {
  name: "Name",
  role: "Role",
  traits: "Traits",
  flaws: "Flaws",
  motivations: "Motivations",
  backstory: "Backstory",
  arc: "Arc",
  relationships: "Relationships",
};

function CharacterCard({ character }: { character: CharacterSuggestion }) {
  return (
    <div className="p-4 rounded-lg border border-fg/10 bg-bg/50 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-fg">{character.name}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand">
          {character.role}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Field label="Traits" items={character.traits} />
        <Field label="Flaws" items={character.flaws} />
        <Field label="Motivations" items={character.motivations} />
        <Field label="Relationships" items={character.relationships} />
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-xs font-medium text-fg/60">{featureLabels.backstory}</span>
          <p className="text-sm text-fg/80 mt-0.5">{character.backstory}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-fg/60">{featureLabels.arc}</span>
          <p className="text-sm text-fg/80 mt-0.5">{character.arc}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <span className="text-xs font-medium text-fg/60">{label}</span>
      <ul className="mt-0.5 space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-fg/75 flex items-start gap-1">
            <span className="text-brand mt-1 shrink-0">&#8226;</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AiCharacterPanel({ context, projectId, className = "" }: AiCharacterPanelProps) {
  const [characters, setCharacters] = useState<CharacterSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isEnabledSync("aiAssist") && !isEnabledSync("aiCharacterDevelopment")) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, projectId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Character generation failed");
      }
      const data = await res.json();
      setCharacters(data.suggestions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Character generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-brand/30 text-brand hover:bg-brand/5 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
            Generating characters...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            Generate Character Ideas
          </>
        )}
      </button>

      {error && (
        <div className="p-3 rounded-md border border-red-500/20 bg-red-500/5 text-sm text-red-400">
          {error}
        </div>
      )}

      {characters.length > 0 && (
        <div className="space-y-3">
          {characters.map((character, i) => (
            <CharacterCard key={i} character={character} />
          ))}
        </div>
      )}
    </div>
  );
}
