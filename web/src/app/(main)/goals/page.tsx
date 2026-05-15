import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { GoalForm } from "./goal-form";
import { Target, BookOpen, FileText, Layout } from "lucide-react";

const TYPE_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  words_per_day: { label: "Words per day", icon: BookOpen },
  pages_per_week: { label: "Pages per week", icon: FileText },
  scenes_completed: { label: "Scenes completed", icon: Layout },
  panels_per_day: { label: "Panels per day", icon: Target },
};

function TypeIcon({ type }: { type: string }) {
  const meta = TYPE_META[type];
  if (!meta) return <Target className="h-5 w-5 text-fg/40" />;
  const Icon = meta.icon;
  return <Icon className="h-5 w-5 text-brand" />;
}

function TypeLabel({ type }: { type: string }) {
  return <>{TYPE_META[type]?.label ?? type}</>;
}

export default async function GoalsPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-extrabold mb-2">Goals</h1>
      <p className="text-fg/60 mb-8">Set writing targets and track your progress.</p>

      <Card className="p-6 mb-10">
        <h2 className="text-lg font-bold mb-4">Create a Goal</h2>
        <GoalForm />
      </Card>

      <h2 className="text-lg font-bold mb-4">Your Goals</h2>
      {goals.length === 0 ? (
        <EmptyState
          icon={<Target className="h-6 w-6 text-fg/30" />}
          title="No goals yet"
          description="Set your first writing goal above to start tracking progress."
        />
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <Card key={goal.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TypeIcon type={goal.type} />
                <div>
                  <p className="font-medium text-sm">
                    <TypeLabel type={goal.type} />
                  </p>
                  <p className="text-xs text-fg/40 capitalize">{goal.cadence}</p>
                </div>
              </div>
              <span className="text-lg font-bold text-brand">{goal.target.toLocaleString()}</span>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
