"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { getErrorMessage } from "@/lib/client-api";
import { useApiMutation } from "@/lib/query-hooks";

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
  const createGoalMutation = useApiMutation<unknown, Record<string, unknown>>(
    "/api/gamification/goals",
    {
      onSuccess: () => {
        toast({ title: "Goal created" });
        router.refresh();
      },
      onError: (error) => {
        toast({
          title: "Failed to create goal",
          description: getErrorMessage(error, "Something went wrong."),
          variant: "destructive",
        });
      },
    }
  );

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (target < 1) {
          toast({
            title: "Invalid target",
            description: "Target must be at least 1.",
            variant: "destructive",
          });
          return;
        }

        await createGoalMutation.mutateAsync({
          type,
          target,
          cadence: type === "pages_per_week" ? "weekly" : "daily",
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Type</label>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="border-fg/20 flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:outline-none dark:border-white/10 dark:bg-[color:var(--bg)] dark:ring-offset-[color:var(--bg)]"
        >
          {GOAL_TYPES.map((goal) => (
            <option key={goal.value} value={goal.value}>
              {goal.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Target</label>
        <input
          type="number"
          value={target}
          onChange={(event) => setTarget(Number(event.target.value))}
          min={1}
          className="border-fg/20 placeholder:text-fg/50 flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:outline-none dark:border-white/10 dark:bg-[color:var(--bg)] dark:ring-offset-[color:var(--bg)]"
        />
      </div>
      <Button type="submit" isLoading={createGoalMutation.isPending}>
        Create Goal
      </Button>
    </form>
  );
}
