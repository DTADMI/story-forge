"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";
import { Plus, Trash2 } from "lucide-react";

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
  const [saving, setSaving] = useState(false);

  function addWord() {
    if (!newWord.trim() || !newMeaning.trim()) return;
    setVocabulary((prev) => [...prev, { word: newWord.trim(), meaning: newMeaning.trim() }]);
    setNewWord("");
    setNewMeaning("");
  }

  function removeWord(index: number) {
    setVocabulary((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const structuredContent = {
        phonology: phonology.trim(),
        grammarRules: grammarRules.trim(),
        script: script.trim(),
        vocabulary: vocabulary.map((v) => ({ word: v.word, meaning: v.meaning })),
      };
      const vocabStr = vocabulary.length > 0
        ? `\n**Vocabulary:**\n${vocabulary.map((v) => `${v.word} — ${v.meaning}`).join("\n")}`
        : "";
      const content = `**Phonology:** ${phonology || "N/A"}\n**Grammar Rules:** ${grammarRules || "N/A"}\n**Script/Alphabet:** ${script || "N/A"}${vocabStr}`;

      const res = await fetch("/api/world/encyclopedia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "language",
          title: name.trim(),
          content,
          metadata: structuredContent,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Language created!" });
      onSaved?.();
    } catch {
      toast({ title: "Failed to save language", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Language Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Elvish"
          className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phonology</label>
        <textarea
          value={phonology}
          onChange={(e) => setPhonology(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
          placeholder="Sound inventory, phonotactics..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Grammar Rules</label>
        <textarea
          value={grammarRules}
          onChange={(e) => setGrammarRules(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
          placeholder="Word order, morphology, syntax..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Script / Alphabet</label>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
          placeholder="Writing system description..."
        />
      </div>

      {/* Vocabulary */}
      <div>
        <label className="block text-sm font-medium mb-1">Vocabulary</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Word"
            className="flex-1 rounded-md border border-fg/20 px-2 py-1.5 text-sm bg-bg"
          />
          <input
            value={newMeaning}
            onChange={(e) => setNewMeaning(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addWord())}
            placeholder="Meaning"
            className="flex-1 rounded-md border border-fg/20 px-2 py-1.5 text-sm bg-bg"
          />
          <button
            onClick={addWord}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-brand text-white rounded-md hover:bg-brand/90"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        {vocabulary.length > 0 && (
          <div className="max-h-48 overflow-y-auto border border-fg/10 rounded-md">
            {vocabulary.map((v, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs py-1.5 px-2 border-b border-fg/5 last:border-0 hover:bg-fg/5"
              >
                <span>
                  <span className="font-medium">{v.word}</span>
                  <span className="text-fg/40 ml-2">— {v.meaning}</span>
                </span>
                <button
                  onClick={() => removeWord(i)}
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
          onClick={handleSave}
          disabled={saving}
          className="bg-brand text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-brand/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Create Language"}
        </button>
      </div>
    </div>
  );
}
