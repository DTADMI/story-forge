"use client";

import { useState } from "react";
import { isEnabledSync } from "@/lib/flags";
import { useApiMutation } from "@/lib/query-hooks";
import { getErrorMessage } from "@/lib/client-api";

interface ResearchFinding {
  topic: string;
  summary: string;
  details: string;
  reliability: string;
  sources: string[];
}

interface ResearchResult {
  findings: ResearchFinding[];
  accuracyNotes: string;
  writingTips: string[];
  furtherReading: string[];
}

interface AiResearchPanelProps {
  context?: string;
  projectId?: string;
  className?: string;
}

export function AiResearchPanel({ context, projectId, className = "" }: AiResearchPanelProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);

  const researchQuery = useApiMutation<
    ResearchResult,
    { query: string; context?: string; projectId?: string }
  >("/api/ai/research", {
    onSuccess: (data) => setResult(data),
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    researchQuery.mutate({ query: query.trim(), context, projectId });
  };

  if (!isEnabledSync("ai_assist") && !isEnabledSync("ai_research_assistant")) return null;

  const reliabilityColors: Record<string, string> = {
    high: "text-green-400 bg-green-500/10",
    medium: "text-yellow-400 bg-yellow-500/10",
    low: "text-red-400 bg-red-500/10",
    speculative: "text-fg/50 bg-fg/10",
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Ask about historical facts, science, culture..."
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-fg/20 bg-bg text-fg placeholder-fg/40 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
        />
        <button
          onClick={handleSearch}
          disabled={researchQuery.isPending || !query.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-brand/30 text-brand hover:bg-brand/5 disabled:opacity-50 transition-colors shrink-0"
        >
          {researchQuery.isPending ? (
            <span className="inline-block w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          ) : (
            "Research"
          )}
        </button>
      </div>

      {researchQuery.error && (
        <div className="p-3 rounded-md border border-red-500/20 bg-red-500/5 text-sm text-red-400">
          {getErrorMessage(researchQuery.error, "Research request failed")}
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-fg/10 bg-bg/50 overflow-hidden">
          {result.accuracyNotes && (
            <div className="px-4 py-2 border-b border-fg/10 bg-brand/5 text-xs text-fg/60">
              {result.accuracyNotes}
            </div>
          )}

          <div className="p-4 space-y-4">
            {result.findings.map((finding, i) => (
              <div key={i} className="p-3 rounded-md border border-fg/10 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-fg">{finding.topic}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${reliabilityColors[finding.reliability] ?? reliabilityColors.speculative}`}
                  >
                    {finding.reliability}
                  </span>
                </div>
                <p className="text-sm text-fg/80">{finding.summary}</p>
                {finding.details && <p className="text-sm text-fg/60">{finding.details}</p>}
                {finding.sources.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-fg/40">Sources</span>
                    <ul className="mt-1 space-y-0.5">
                      {finding.sources.map((src, j) => (
                        <li key={j} className="text-xs text-fg/50">
                          {src}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            {result.writingTips.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-fg/90 mb-2">Writing Tips</h4>
                <ul className="space-y-1">
                  {result.writingTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-fg/75">
                      <span className="text-brand mt-1 shrink-0">&#8226;</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.furtherReading.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-fg/90 mb-2">Further Reading</h4>
                <ul className="space-y-0.5">
                  {result.furtherReading.map((topic, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-fg/50">
                      <span className="text-fg/30 mt-1 shrink-0">&#8226;</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
