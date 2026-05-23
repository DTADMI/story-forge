"use client";

import { useState } from "react";
import { isEnabledSync } from "@/lib/flags";

interface StyleSuggestion {
  text: string;
  issue: string;
  rewrite: string;
}

interface StyleAnalysis {
  analysis: {
    voice: string;
    tone: string;
    readability: string;
    sentenceVariety: string;
    wordChoice: string;
    consistency: string;
  };
  strengths: string[];
  improvements: string[];
  suggestions: StyleSuggestion[];
  styleProfile: {
    formality: string;
    density: string;
    emotion: string;
  };
}

interface AiStylePanelProps {
  context: string;
  projectId?: string;
  styleGuide?: string;
  className?: string;
}

export function AiStylePanel({
  context,
  projectId,
  styleGuide,
  className = "",
}: AiStylePanelProps) {
  const [analysis, setAnalysis] = useState<StyleAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "strengths" | "suggestions" | "profile">(
    "analysis"
  );

  if (!isEnabledSync("aiAssist") && !isEnabledSync("aiStyleConsistency")) return null;

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, projectId, styleGuide }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Style analysis failed");
      }
      const data = await res.json();
      setAnalysis(data as StyleAnalysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Style analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "analysis" as const, label: "Analysis" },
    { key: "strengths" as const, label: "Strengths" },
    { key: "suggestions" as const, label: "Suggestions" },
    { key: "profile" as const, label: "Profile" },
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
            Analyzing style...
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
                d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
              />
            </svg>
            Check Style Consistency
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
            {activeTab === "analysis" && (
              <div className="space-y-3 text-sm text-fg/80">
                <Section title="Voice" content={analysis.analysis.voice} />
                <Section title="Tone" content={analysis.analysis.tone} />
                <Section title="Readability" content={analysis.analysis.readability} />
                <Section title="Sentence Variety" content={analysis.analysis.sentenceVariety} />
                <Section title="Word Choice" content={analysis.analysis.wordChoice} />
                <Section title="Consistency" content={analysis.analysis.consistency} />
              </div>
            )}

            {activeTab === "strengths" && (
              <div className="space-y-3">
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-fg/80">
                      <span className="text-green-400 mt-1 shrink-0">&#10003;</span>
                      {s}
                    </li>
                  ))}
                </ul>
                {analysis.improvements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-fg/90 mb-2">Areas to Improve</h4>
                    <ul className="space-y-1.5">
                      {analysis.improvements.map((imp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-fg/80">
                          <span className="text-yellow-400 mt-1 shrink-0">&#8594;</span>
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "suggestions" && (
              <div className="space-y-3">
                {analysis.suggestions.map((sugg, i) => (
                  <div key={i} className="p-3 rounded-md bg-fg/5 border border-fg/10 space-y-2">
                    <div>
                      <span className="text-xs font-medium text-fg/50">Original</span>
                      <p className="text-sm text-fg/80 italic mt-0.5">&ldquo;{sugg.text}&rdquo;</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-yellow-400">
                        Issue: {sugg.issue}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-fg/50">Suggested Rewrite</span>
                      <p className="text-sm text-green-300 mt-0.5">&ldquo;{sugg.rewrite}&rdquo;</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "profile" && analysis.styleProfile && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ProfileBadge label="Formality" value={analysis.styleProfile.formality} />
                <ProfileBadge label="Density" value={analysis.styleProfile.density} />
                <ProfileBadge label="Emotion" value={analysis.styleProfile.emotion} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h4 className="font-medium text-fg/90 mb-1">{title}</h4>
      <p>{content}</p>
    </div>
  );
}

function ProfileBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-md bg-brand/5 border border-brand/10 text-center">
      <span className="text-xs font-medium text-fg/50">{label}</span>
      <p className="text-sm font-semibold text-brand capitalize mt-1">{value}</p>
    </div>
  );
}
