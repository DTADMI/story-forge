"use client";

import { useState } from "react";
import { isEnabledSync } from "@/lib/flags";

interface PlotRecommendation {
  area: string;
  suggestion: string;
}

interface PlotAnalysis {
  analysis: {
    overview: string;
    structure: string;
    pacing: string;
    conflict: string;
    characters: string;
    resolution: string;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: PlotRecommendation[];
  score: number;
}

interface AiPlotPanelProps {
  context: string;
  projectId?: string;
  className?: string;
}

export function AiPlotPanel({ context, projectId, className = "" }: AiPlotPanelProps) {
  const [analysis, setAnalysis] = useState<PlotAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "strengths" | "weaknesses" | "recommendations"
  >("overview");

  if (!isEnabledSync("aiAssist") && !isEnabledSync("aiPlotAnalysis")) return null;

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/plot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, projectId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Plot analysis failed");
      }
      const data = await res.json();
      setAnalysis(data as PlotAnalysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Plot analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "strengths" as const, label: "Strengths" },
    { key: "weaknesses" as const, label: "Weaknesses" },
    { key: "recommendations" as const, label: "Recommendations" },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-brand/30 text-brand hover:bg-brand/5 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
            Analyzing plot...
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
                d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
              />
            </svg>
            Analyze Story Structure
          </>
        )}
      </button>

      {error && (
        <div className="p-3 rounded-md border border-red-500/20 bg-red-500/5 text-sm text-red-400">
          {error}
        </div>
      )}

      {analysis && (
        <div className="rounded-lg border border-fg/10 bg-bg/50 overflow-hidden">
          {analysis.score > 0 && (
            <div className="px-4 py-3 border-b border-fg/10 flex items-center justify-between">
              <span className="text-sm font-medium text-fg">Plot Score</span>
              <span
                className={`text-lg font-bold ${analysis.score >= 7 ? "text-green-400" : analysis.score >= 4 ? "text-yellow-400" : "text-red-400"}`}
              >
                {analysis.score.toFixed(1)}/10
              </span>
            </div>
          )}

          <div className="flex border-b border-fg/10">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-brand border-b-2 border-brand"
                    : "text-fg/50 hover:text-fg/75"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeTab === "overview" && (
              <div className="space-y-3 text-sm text-fg/80">
                <p>{analysis.analysis.overview}</p>
                <div>
                  <h4 className="font-medium text-fg/90 mb-1">Structure</h4>
                  <p>{analysis.analysis.structure}</p>
                </div>
                <div>
                  <h4 className="font-medium text-fg/90 mb-1">Pacing</h4>
                  <p>{analysis.analysis.pacing}</p>
                </div>
                <div>
                  <h4 className="font-medium text-fg/90 mb-1">Conflict</h4>
                  <p>{analysis.analysis.conflict}</p>
                </div>
                <div>
                  <h4 className="font-medium text-fg/90 mb-1">Characters</h4>
                  <p>{analysis.analysis.characters}</p>
                </div>
                <div>
                  <h4 className="font-medium text-fg/90 mb-1">Resolution</h4>
                  <p>{analysis.analysis.resolution}</p>
                </div>
              </div>
            )}

            {activeTab === "strengths" && (
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-fg/80">
                    <span className="text-green-400 mt-1 shrink-0">&#10003;</span>
                    {s}
                  </li>
                ))}
              </ul>
            )}

            {activeTab === "weaknesses" && (
              <ul className="space-y-2">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-fg/80">
                    <span className="text-yellow-400 mt-1 shrink-0">&#9888;</span>
                    {w}
                  </li>
                ))}
              </ul>
            )}

            {activeTab === "recommendations" && (
              <div className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-md bg-brand/5 border border-brand/10">
                    <span className="text-xs font-medium text-brand uppercase tracking-wide">
                      {rec.area}
                    </span>
                    <p className="text-sm text-fg/80 mt-1">{rec.suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
