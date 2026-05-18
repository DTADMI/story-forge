"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";

interface CharacterProfileData {
  name?: string;
  title?: string;
  alias?: string;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  eyeColor?: string;
  hairColor?: string;
  skinTone?: string;
  distinguishingFeatures?: string;
  personality?: string;
  mbti?: string;
  alignment?: string;
  strengths?: string;
  weaknesses?: string;
  fears?: string;
  motivations?: string;
  backstory?: string;
  occupation?: string;
  birthplace?: string;
  currentResidence?: string;
}

interface CharacterProfileBuilderProps {
  character: {
    id: string;
    name: string;
    traits?: string;
    bio?: string;
    quirks?: string;
    metadata?: CharacterProfileData;
  };
  onSaved?: () => void;
}

export function CharacterProfileBuilder({ character, onSaved }: CharacterProfileBuilderProps) {
  const { toast } = useToast();
  const initialMeta = (character.metadata as CharacterProfileData) || {};
  const [form, setForm] = useState<CharacterProfileData>({
    name: character.name,
    ...initialMeta,
  });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  function update(field: keyof CharacterProfileData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/world/characters/${character.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: form }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Profile saved!" });
      onSaved?.();
    } catch {
      toast({ title: "Failed to save profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const sections = [
    {
      key: "basic",
      label: "Basic Info",
      fields: [
        { key: "title", label: "Title/Alias", type: "text" },
        { key: "alias", label: "Also Known As", type: "text" },
      ] as { key: keyof CharacterProfileData; label: string; type: string }[],
    },
    {
      key: "appearance",
      label: "Appearance",
      fields: [
        { key: "age", label: "Age", type: "text" },
        { key: "gender", label: "Gender", type: "text" },
        { key: "height", label: "Height", type: "text" },
        { key: "weight", label: "Weight", type: "text" },
        { key: "eyeColor", label: "Eye Color", type: "text" },
        { key: "hairColor", label: "Hair Color", type: "text" },
        { key: "skinTone", label: "Skin Tone", type: "text" },
        { key: "distinguishingFeatures", label: "Distinguishing Features", type: "textarea" },
      ] as { key: keyof CharacterProfileData; label: string; type: string }[],
    },
    {
      key: "personality",
      label: "Personality",
      fields: [
        { key: "personality", label: "Personality Traits", type: "textarea" },
        { key: "mbti", label: "MBTI", type: "text" },
        { key: "alignment", label: "Alignment", type: "text" },
        { key: "strengths", label: "Strengths", type: "textarea" },
        { key: "weaknesses", label: "Weaknesses", type: "textarea" },
        { key: "fears", label: "Fears", type: "textarea" },
        { key: "motivations", label: "Motivations", type: "textarea" },
      ] as { key: keyof CharacterProfileData; label: string; type: string }[],
    },
    {
      key: "background",
      label: "Background",
      fields: [
        { key: "backstory", label: "Backstory", type: "textarea" },
        { key: "occupation", label: "Occupation", type: "text" },
        { key: "birthplace", label: "Birthplace", type: "text" },
        { key: "currentResidence", label: "Current Residence", type: "text" },
      ] as { key: keyof CharacterProfileData; label: string; type: string }[],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Character Profile</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1 text-xs bg-brand text-white rounded-md disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {sections.map((section) => (
        <div key={section.key} className="border border-fg/10 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === section.key ? null : section.key)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-fg/5"
          >
            {section.label}
            <span className="text-xs text-fg/40">{expanded === section.key ? "-" : "+"}</span>
          </button>
          {expanded === section.key && (
            <div className="px-3 pb-3 space-y-3">
              {section.fields.map((field) =>
                field.type === "textarea" ? (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-fg/50 mb-1">
                      {field.label}
                    </label>
                    <textarea
                      value={(form[field.key] as string) ?? ""}
                      onChange={(e) => update(field.key, e.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-fg/20 px-2 py-1.5 text-xs bg-bg resize-y"
                    />
                  </div>
                ) : (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-fg/50 mb-1">
                      {field.label}
                    </label>
                    <input
                      value={(form[field.key] as string) ?? ""}
                      onChange={(e) => update(field.key, e.target.value)}
                      className="w-full rounded-md border border-fg/20 px-2 py-1.5 text-xs bg-bg"
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
