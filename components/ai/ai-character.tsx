"use client";

import { useState } from "react";
import { isEnabledSync } from "@/lib/flags";
import { getErrorMessage } from "@/lib/client-api";
import { useApiMutation } from "@/lib/query-hooks";

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

function CharacterCard({ character }: { character: CharacterSuggestion }) {
  return (
    <div className="space-y-3 rounded-lg border border-fg/10 bg-bg/50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-fg">{character.name}</h3>
        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">
          {character.role}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <Field label="Traits" items={character.traits} />
        <Field label="Flaws" items={character.flaws} />
        <Field label="Motivations" items={character.motivations} />
        <Field label="Relationships" items={character.relationships} />
      </div>
      <div className="space-y-2">
        <div>
          <span className="text-xs font-medium text-fg/60">Backstory</span>
          <p className="mt-0.5 text-sm text-fg/80">{character.backstory}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-fg/60">Arc</span>
          <p className="mt-0.5 text-sm text-fg/80">{character.arc}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <span className="text-xs font-medium text-fg/60">{label}</span>
      <ul className="mt-0.5 space-y-0.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-1 text-sm text-fg/75">
            <span className="mt-1 shrink-0 text-brand">&#8226;</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AiCharacterPanel({ context, projectId, className = "" }: AiCharacterPanelProps) {
  const [characters, setCharacters] = useState<CharacterSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const characterMutation = useApiMutation<
    { suggestions?: CharacterSuggestion[] },
    Record<string, unknown>
  >("/api/ai/character", {
    onSuccess: (data) => {
      setCharacters(data.suggestions ?? []);
    },
    onError: (mutationError) => {
      setError(getErrorMessage(mutationError, "Character generation failed"));
    },
  });

  if (!isEnabledSync("ai_assist") && !isEnabledSync("ai_character_development")) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        onClick={() => {
          setError(null);
          characterMutation.mutate({ context, projectId });
        }}
        disabled={characterMutation.isPending}
        className="inline-flex items-center gap-2 rounded-lg border border-brand/30 px-4 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/5 disabled:opacity-50"
      >
        {characterMutation.isPending ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
            Generating characters...
          </>
        ) : (
          <>Generate Character Ideas</>
        )}
      </button>
      {error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {characters.length > 0 && (
        <div className="space-y-3">
          {characters.map((character, index) => (
            <CharacterCard key={index} character={character} />
          ))}
        </div>
      )}
    </div>
  );
}
