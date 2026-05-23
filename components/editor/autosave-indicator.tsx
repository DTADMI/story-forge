"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/toast";
import { CheckCircle2, Loader2 } from "lucide-react";
import { fetchJson, fetchVoid, type ApiError } from "@/lib/client-api";

type SaveStatus = "saved" | "saving" | "unsaved";

interface AutosaveIndicatorProps {
  projectId: string;
  content: string;
  wordCount?: number;
  onSaved?: () => void;
}

export function AutosaveIndicator({
  projectId,
  content,
  wordCount,
  onSaved,
}: AutosaveIndicatorProps) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const { toast } = useToast();
  const lastSavedRef = useRef(content);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const saveMutation = useMutation<unknown, ApiError, string>({
    mutationFn: async (contentToSave: string) => {
      const wc = contentToSave.trim() ? contentToSave.trim().split(/\s+/).length : 0;
      await fetchJson(`/api/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({ content: contentToSave, wordCount: wordCount ?? wc }),
      });
      const delta = wordCount !== undefined ? wc - wordCount : wc;
      if (delta > 0) {
        try {
          await fetchVoid("/api/gamification/progress", {
            method: "POST",
            body: JSON.stringify({ value: Math.max(0, delta) }),
          });
        } catch {
          // progress logging is non-critical
        }
      }
    },
    onSuccess: (_data, contentToSave) => {
      if (mountedRef.current) {
        setStatus("saved");
        lastSavedRef.current = contentToSave;
        onSaved?.();
      }
    },
    onError: () => {
      if (mountedRef.current) {
        setStatus("unsaved");
        toast({
          title: "Autosave failed",
          description: "Your changes have not been saved. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const save = useCallback(
    (contentToSave: string) => {
      setStatus("saving");
      saveMutation.mutate(contentToSave);
    },
    [saveMutation]
  );

  useEffect(() => {
    if (content === lastSavedRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (status !== "saving") setStatus("saved");
      return;
    }

    setStatus("unsaved");

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        save(content);
      }
    }, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content, save, status]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    if (status === "unsaved" && content !== lastSavedRef.current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      save(content);
    }
  }, [status, content, save]);

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-xs cursor-pointer"
      title={
        status === "saved"
          ? "Saved"
          : status === "saving"
            ? "Saving..."
            : "Unsaved changes — click to save now"
      }
    >
      {status === "saved" && (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span className="text-fg/50">Saved</span>
        </>
      )}
      {status === "saving" && (
        <>
          <Loader2 className="h-3.5 w-3.5 text-fg/40 animate-spin" />
          <span className="text-fg/40">Saving...</span>
        </>
      )}
      {status === "unsaved" && (
        <>
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <span className="text-yellow-600 dark:text-yellow-400">Unsaved changes</span>
        </>
      )}
    </button>
  );
}
