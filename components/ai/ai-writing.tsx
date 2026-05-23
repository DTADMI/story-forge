"use client";

import { useState } from "react";
import { isEnabledSync } from "@/lib/flags";
import { getErrorMessage } from "@/lib/client-api";
import { useApiMutation } from "@/lib/query-hooks";

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
  const [error, setError] = useState<string | null>(null);
  const featureLabels: Record<string, string> = {
    suggest: "AI Writing Suggestion",
    character: "AI Character Development",
    plot: "AI Plot Analysis",
    style: "AI Style Check",
  };
  const suggestionMutation = useApiMutation<{ suggestion?: string }, Record<string, unknown>>(
    "/api/ai/suggest",
    {
      onSuccess: (data) => {
        if (data.suggestion) onSuggestion(data.suggestion);
      },
      onError: (mutationError) => {
        setError(getErrorMessage(mutationError, "AI request failed"));
      },
    }
  );

  if (!isEnabledSync("aiAssist") && !isEnabledSync("aiWritingSuggestions")) return null;

  return (
    <div className={className}>
      <button
        onClick={() => {
          setError(null);
          suggestionMutation.mutate({ feature, context });
        }}
        disabled={suggestionMutation.isPending}
        className="inline-flex items-center gap-1 rounded-md border border-brand/30 px-3 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand/5 disabled:opacity-50"
        title={featureLabels[feature]}
      >
        {suggestionMutation.isPending ? (
          <>
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
            Thinking...
          </>
        ) : (
          <>
            <svg
              className="h-3.5 w-3.5"
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
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
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
  const suggestionsMutation = useApiMutation<{ suggestions?: string[] }, Record<string, unknown>>(
    "/api/ai/suggest",
    {
      onSuccess: (data) => {
        setSuggestions(data.suggestions ?? []);
      },
    }
  );

  if (!isEnabledSync("aiAssist") && !isEnabledSync("aiWritingSuggestions")) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            suggestionsMutation.mutate({ feature: "suggest", context, multiple: true })
          }
          disabled={suggestionsMutation.isPending}
          className="text-xs text-brand hover:underline disabled:opacity-50"
        >
          {suggestionsMutation.isPending
            ? "Generating suggestions..."
            : "Get AI writing suggestions"}
        </button>
      </div>
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onInsert(suggestion)}
          className="block w-full rounded border border-fg/10 p-2 text-left text-sm transition-colors hover:border-brand/30 hover:bg-fg/5"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
