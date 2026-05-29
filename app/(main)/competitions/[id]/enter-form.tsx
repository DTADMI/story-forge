"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { fetchVoid } from "@/lib/client-api";

interface ProjectOption {
  id: string;
  title: string;
  wordCount: number;
  isPublic: boolean;
}

export function EnterCompetitionForm({
  competitionId,
  competitionTitle,
  userProjects,
  minWords,
  maxWords,
  enteredProjectId,
}: {
  competitionId: string;
  competitionTitle: string;
  userProjects: ProjectOption[];
  minWords: number;
  maxWords?: number;
  enteredProjectId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const eligibleProjects = userProjects.filter(
    (p) => p.isPublic && p.wordCount >= minWords && (!maxWords || p.wordCount <= maxWords)
  );

  const handleEnter = async (projectId: string) => {
    setPending(true);
    try {
      await fetchVoid(`/api/competitions/${competitionId}/enter`, {
        method: "POST",
        body: JSON.stringify({ projectId }),
      });
      toast({ title: "Entered competition!" });
      setOpen(false);
      router.refresh();
    } catch {
      toast({ title: "Failed to enter", variant: "destructive" });
    } finally {
      setPending(false);
    }
  };

  if (enteredProjectId) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="shrink-0 px-5 py-2.5 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand/90 transition-colors"
      >
        Enter Now
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl animate-sf-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">Enter Competition</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select a public project to enter into &quot;{competitionTitle}&quot;
            </p>
            <p className="text-xs text-fg/40 mb-3">
              Requirements: {minWords.toLocaleString()}+ words
              {maxWords ? `, max ${maxWords.toLocaleString()} words` : ""}, public visibility
            </p>

            {eligibleProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No eligible projects found. Make sure you have a public project with at least{" "}
                {minWords.toLocaleString()} words.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {eligibleProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleEnter(project.id)}
                    disabled={pending}
                    className="w-full text-left p-3 rounded-md border border-fg/10 hover:border-brand hover:bg-brand/5 transition-colors disabled:opacity-50"
                  >
                    <p className="text-sm font-medium">{project.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {project.wordCount.toLocaleString()} words
                    </p>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm rounded-md border border-fg/20 hover:bg-fg/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
