"use client";

import { useEffect, useState, useCallback } from "react";
import { Editor } from "@/components/editor/editor";
import { AiWritingButton } from "@/components/ai/ai-writing";
import { useRouter } from "next/navigation";

interface ProjectEditorProps {
  project: {
    id: string;
    title: string;
    description?: string;
    content?: string;
    defaultScope: string;
  };
  userPreferences?: {
    breakReminders?: boolean;
  };
}

export function ProjectEditor({ project, userPreferences }: ProjectEditorProps) {
  const [content, setContent] = useState(project.content || "");
  const [saving, setSaving] = useState(false);
  const [lastBreak, setLastBreak] = useState(Date.now());
  const router = useRouter();

  useEffect(() => {
    if (!userPreferences?.breakReminders) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const minsSinceBreak = (now - lastBreak) / 1000 / 60;
      if (minsSinceBreak >= 45) {
        if (confirm("You have been writing for 45 minutes. Take a short break to stay fresh!")) {
          setLastBreak(now);
        } else {
          // SNOOZE: add 15 mins
          setLastBreak(now - 30 * 60 * 1000);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastBreak, userPreferences?.breakReminders]);

  const handleSave = async (newContent: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      if (res.ok) {
        // Success
      }
    } catch (err) {
      console.error("Failed to save", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAiSuggestion = useCallback((suggestion: string) => {
    setContent((prev) => prev + "\n\n" + suggestion);
  }, []);

  const lastParagraph = content.split(/\n\n+/).pop() ?? content.slice(-500);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold">{project.title}</h1>
          <AiWritingButton
            context={lastParagraph}
            onSuggestion={handleAiSuggestion}
            feature="suggest"
          />
        </div>
        {saving && <span className="text-sm text-fg/50 animate-pulse">Saving...</span>}
      </div>
      <Editor content={content} onChange={setContent} onSave={handleSave} />
    </div>
  );
}
