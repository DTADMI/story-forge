"use client";

import { useState } from "react";
import { isEnabledSync } from "@/lib/flags";

interface AiWritingSuggestionProps {
  context: string;
  onSuggestion: (text: string) => void;
  feature?: "suggest" | "character" | "plot" | "style";
  className?: string;
}

export function AiWritingButton({
  context,
  onSuggestion,
  feature = "suggest",
  className = "",
}: AiWritingSuggestionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isEnabledSync("aiAssist") && !isEnabledSync("aiWritingSuggestions")) return null;

  const featureLabels: Record<string, string> = {
    suggest: "AI Writing Suggestion",
    character: "AI Character Development",
    plot: "AI Plot Analysis",
    style: "AI Style Check",
  };

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, context }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      if (data.suggestion) {
        onSuggestion(data.suggestion);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-brand/30 text-brand hover:bg-brand/5 disabled:opacity-50 transition-colors"
        title={featureLabels[feature]}
      >
        {loading ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
            Thinking...
          </>
        ) : (
          <>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
              />
            </svg>
            {featureLabels[feature]}
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

interface AiSuggestPanelProps {
  context: string;
  onInsert: (text: string) => void;
  className?: string;
}

export function AiSuggestPanel({ context, onInsert, className = "" }: AiSuggestPanelProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isEnabledSync("aiAssist") && !isEnabledSync("aiWritingSuggestions")) return null;

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature: "suggest", context, multiple: true }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="text-xs text-brand hover:underline disabled:opacity-50"
        >
          {loading ? "Generating suggestions..." : "Get AI writing suggestions"}
        </button>
      </div>
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onInsert(s)}
          className="block w-full text-left text-sm p-2 rounded border border-fg/10 hover:bg-fg/5 hover:border-brand/30 transition-colors"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
