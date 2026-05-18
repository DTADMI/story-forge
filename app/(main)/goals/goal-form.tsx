"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

const GOAL_TYPES: { value: string; label: string }[] = [
  { value: "words_per_day", label: "Words per day" },
  { value: "pages_per_week", label: "Pages per week" },
  { value: "scenes_completed", label: "Scenes completed" },
  { value: "panels_per_day", label: "Panels per day" },
];

export function GoalForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [type, setType] = useState("words_per_day");
  const [target, setTarget] = useState(500);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (target < 1) {
      toast({
        title: "Invalid target",
        description: "Target must be at least 1.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const cadence = type === "pages_per_week" ? "weekly" : "daily";
      const res = await fetch("/api/gamification/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, target, cadence }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast({
          title: "Failed to create goal",
          description: data.error || "Something went wrong.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Goal created" });
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Could not connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border-fg/20 flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:outline-none dark:border-white/10 dark:bg-[color:var(--bg)] dark:ring-offset-[color:var(--bg)]"
        >
          {GOAL_TYPES.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Target</label>
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          min={1}
          className="border-fg/20 placeholder:text-fg/50 flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:outline-none dark:border-white/10 dark:bg-[color:var(--bg)] dark:ring-offset-[color:var(--bg)]"
        />
      </div>
      <Button type="submit" isLoading={isLoading}>
        Create Goal
      </Button>
    </form>
  );
}
