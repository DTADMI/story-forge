"use client";

import { useState } from "react";
import { LayoutGrid } from "lucide-react";

export type PanelLayout =
  | "single"
  | "split"
  | "grid2"
  | "grid3"
  | "grid4"
  | "row"
  | "column"
  | "hero-shot"
  | "dialogue"
  | "action-sequence"
  | "establishing"
  | "cliffhanger";

export interface TemplateDefinition {
  id: PanelLayout;
  name: string;
  description: string;
  panelCount: number;
  layout: string;
  suggestions: Partial<PanelTemplate> | Partial<PanelTemplate>[];
}

export interface PanelTemplate {
  number: number;
  description: string;
  caption?: string;
}

const TEMPLATES: TemplateDefinition[] = [
  {
    id: "single",
    name: "Single Panel",
    description: "One full-width panel for a key moment.",
    panelCount: 1,
    layout: "1fr",
    suggestions: { description: "Full-page illustration of the pivotal scene." },
  },
  {
    id: "split",
    name: "Split Screen",
    description: "Two panels side by side showing parallel action.",
    panelCount: 2,
    layout: "1fr 1fr",
    suggestions: [
      { number: 1, description: "Character A reacts to the event." },
      { number: 2, description: "Character B reacts elsewhere." },
    ],
  },
  {
    id: "grid2",
    name: "2x2 Grid",
    description: "Four panels in a 2x2 grid for montage sequences.",
    panelCount: 4,
    layout: "1fr 1fr",
    suggestions: [
      { number: 1, description: "Panel 1: Opening shot." },
      { number: 2, description: "Panel 2: Detail or reaction." },
      { number: 3, description: "Panel 3: Wider action." },
      { number: 4, description: "Panel 4: Closing beat." },
    ],
  },
  {
    id: "grid3",
    name: "Triptych",
    description: "Three panels in a row for sequential storytelling.",
    panelCount: 3,
    layout: "1fr 1fr 1fr",
    suggestions: [
      { number: 1, description: "Setup: Establish the scene." },
      { number: 2, description: "Conflict: The turning point." },
      { number: 3, description: "Resolution: The aftermath." },
    ],
  },
  {
    id: "grid4",
    name: "Quad Panel",
    description: "Four panels in a row for rapid pacing.",
    panelCount: 4,
    layout: "1fr 1fr 1fr 1fr",
    suggestions: [
      { number: 1, description: "" },
      { number: 2, description: "" },
      { number: 3, description: "" },
      { number: 4, description: "" },
    ],
  },
  {
    id: "row",
    name: "Horizontal Row",
    description: "Two panels stacked vertically for sequential action.",
    panelCount: 2,
    layout: "1fr",
    suggestions: [
      { number: 1, description: "Top panel: Opening action." },
      { number: 2, description: "Bottom panel: Follow-up." },
    ],
  },
  {
    id: "column",
    name: "Vertical Column",
    description: "Two panels side by side for a dramatic reveal.",
    panelCount: 2,
    layout: "1fr 1fr",
    suggestions: [
      { number: 1, description: "Left: Close-up." },
      { number: 2, description: "Right: Wide shot reveal." },
    ],
  },
  {
    id: "hero-shot",
    name: "Hero Shot",
    description: "Large hero panel with two smaller detail panels below.",
    panelCount: 3,
    layout: "2fr 1fr",
    suggestions: [
      {
        number: 1,
        description: "Large hero panel: Iconic character or scene moment.",
        caption: "Hero Shot",
      },
      { number: 2, description: "Small detail: Important object or facial expression." },
      { number: 3, description: "Small detail: Environment or reaction shot." },
    ],
  },
  {
    id: "dialogue",
    name: "Dialogue Scene",
    description: "Three panels alternating between speakers.",
    panelCount: 3,
    layout: "1fr 1fr 1fr",
    suggestions: [
      { number: 1, description: "Speaker A: Opening line.", caption: "Speaker A" },
      { number: 2, description: "Speaker B: Response or reaction.", caption: "Speaker B" },
      {
        number: 3,
        description: "Speaker A or C: Turning point in conversation.",
        caption: "Speaker A",
      },
    ],
  },
  {
    id: "action-sequence",
    name: "Action Sequence",
    description: "Five rapid panels for fast-paced action.",
    panelCount: 5,
    layout: "1fr 1fr 1fr",
    suggestions: [
      { number: 1, description: "Wind-up: Character prepares to strike." },
      { number: 2, description: "Impact: The blow lands." },
      { number: 3, description: "Reaction: Target reels backward." },
      { number: 4, description: "Follow-through: Additional action." },
      { number: 5, description: "Result: Aftermath of the sequence." },
    ],
  },
  {
    id: "establishing",
    name: "Establishing Shot",
    description: "Wide establishing panel followed by three detail panels.",
    panelCount: 4,
    layout: "2fr 1fr 1fr",
    suggestions: [
      {
        number: 1,
        description: "Wide shot: Panoramic view of the location.",
        caption: "Establishing",
      },
      { number: 2, description: "Medium shot: Character enters the scene." },
      { number: 3, description: "Close-up: Important detail or object." },
      { number: 4, description: "Character reaction to the environment." },
    ],
  },
  {
    id: "cliffhanger",
    name: "Cliffhanger Page",
    description: "Build-up leading to a dramatic final panel reveal.",
    panelCount: 4,
    layout: "1fr 1fr 1fr",
    suggestions: [
      { number: 1, description: "Normal scene: Characters going about their business." },
      { number: 2, description: "Hint: Something is wrong. Shadow or sound." },
      { number: 3, description: "Tension: Characters react. Eyes widen." },
      {
        number: 4,
        description: "REVEAL: The shocking truth. Full-page impact.",
        caption: "TO BE CONTINUED...",
      },
    ],
  },
];

interface PanelTemplatesProps {
  onApply: (templates: PanelTemplate[]) => void;
  className?: string;
}

export function PanelTemplates({ onApply, className = "" }: PanelTemplatesProps) {
  const [expanded, setExpanded] = useState(false);

  function handleApply(template: TemplateDefinition) {
    const panels: PanelTemplate[] = Array.from({ length: template.panelCount }, (_, i) => {
      const suggestion = Array.isArray(template.suggestions)
        ? template.suggestions[i]
        : template.suggestions;
      return {
        number: i + 1,
        description: suggestion?.description ?? "",
        caption: suggestion?.caption,
      };
    });
    onApply(panels);
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-lg border border-dashed border-fg/20 px-3 py-2 text-sm font-medium text-fg/60 hover:border-brand/30 hover:text-fg"
      >
        <span className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          Panel Templates
        </span>
        <span className="text-xs">{expanded ? "Hide" : "Show"}</span>
      </button>

      {expanded && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleApply(template)}
              className="flex flex-col items-start gap-1 rounded-lg border border-fg/10 bg-bg px-3 py-2.5 text-left transition-colors hover:border-brand/30 hover:bg-brand/5"
              title={template.description}
            >
              <span className="text-sm font-medium text-fg">{template.name}</span>
              <span className="text-xs text-fg/50">
                {template.panelCount} panel{template.panelCount > 1 ? "s" : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
