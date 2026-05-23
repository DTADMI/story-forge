"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/toast";
import { getErrorMessage } from "@/lib/client-api";
import { useApiMutation } from "@/lib/query-hooks";

interface VocabWord {
  word: string;
  meaning: string;
}

interface LanguageBuilderProps {
  onSaved?: () => void;
}

export function LanguageBuilder({ onSaved }: LanguageBuilderProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phonology, setPhonology] = useState("");
  const [grammarRules, setGrammarRules] = useState("");
  const [script, setScript] = useState("");
  const [vocabulary, setVocabulary] = useState<VocabWord[]>([]);
  const [newWord, setNewWord] = useState("");
  const [newMeaning, setNewMeaning] = useState("");
  const createLanguageMutation = useApiMutation<unknown, Record<string, unknown>>(
    "/api/world/encyclopedia",
    {
      onSuccess: () => {
        toast({ title: "Language created." });
        onSaved?.();
      },
      onError: (error) => {
        toast({
          title: "Failed to save language",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      },
    }
  );

  function addWord() {
    if (!newWord.trim() || !newMeaning.trim()) return;
    setVocabulary((current) => [...current, { word: newWord.trim(), meaning: newMeaning.trim() }]);
    setNewWord("");
    setNewMeaning("");
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Language Name</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Elvish"
          className="w-full rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Phonology</label>
        <textarea
          value={phonology}
          onChange={(event) => setPhonology(event.target.value)}
          rows={2}
          className="w-full resize-y rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          placeholder="Sound inventory, phonotactics..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Grammar Rules</label>
        <textarea
          value={grammarRules}
          onChange={(event) => setGrammarRules(event.target.value)}
          rows={3}
          className="w-full resize-y rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          placeholder="Word order, morphology, syntax..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Script / Alphabet</label>
        <textarea
          value={script}
          onChange={(event) => setScript(event.target.value)}
          rows={2}
          className="w-full resize-y rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          placeholder="Writing system description..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Vocabulary</label>
        <div className="mb-2 flex items-center gap-2">
          <input
            value={newWord}
            onChange={(event) => setNewWord(event.target.value)}
            placeholder="Word"
            className="flex-1 rounded-md border border-fg/20 bg-bg px-2 py-1.5 text-sm"
          />
          <input
            value={newMeaning}
            onChange={(event) => setNewMeaning(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addWord())}
            placeholder="Meaning"
            className="flex-1 rounded-md border border-fg/20 bg-bg px-2 py-1.5 text-sm"
          />
          <button
            onClick={addWord}
            className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand/90"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        {vocabulary.length > 0 && (
          <div className="max-h-48 overflow-y-auto rounded-md border border-fg/10">
            {vocabulary.map((entry, index) => (
              <div
                key={`${entry.word}-${index}`}
                className="flex items-center justify-between border-b border-fg/5 px-2 py-1.5 text-xs last:border-0 hover:bg-fg/5"
              >
                <span>
                  <span className="font-medium">{entry.word}</span>
                  <span className="ml-2 text-fg/40">- {entry.meaning}</span>
                </span>
                <button
                  onClick={() => setVocabulary((current) => current.filter((_, i) => i !== index))}
                  className="text-fg/30 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={async () => {
            if (!name.trim()) {
              toast({ title: "Name is required", variant: "destructive" });
              return;
            }

            const structuredContent = {
              phonology: phonology.trim(),
              grammarRules: grammarRules.trim(),
              script: script.trim(),
              vocabulary: vocabulary.map((entry) => ({
                word: entry.word,
                meaning: entry.meaning,
              })),
            };
            const vocabularyText =
              vocabulary.length > 0
                ? `\n**Vocabulary:**\n${vocabulary.map((entry) => `${entry.word} - ${entry.meaning}`).join("\n")}`
                : "";

            await createLanguageMutation.mutateAsync({
              category: "language",
              title: name.trim(),
              content: `**Phonology:** ${phonology || "N/A"}\n**Grammar Rules:** ${grammarRules || "N/A"}\n**Script/Alphabet:** ${script || "N/A"}${vocabularyText}`,
              metadata: structuredContent,
            });
          }}
          disabled={createLanguageMutation.isPending}
          className="rounded-md bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
        >
          {createLanguageMutation.isPending ? "Saving..." : "Create Language"}
        </button>
      </div>
    </div>
  );
}
