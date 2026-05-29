"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CompetitionData {
  id: string;
  title: string;
  description?: string;
  type: string;
  genre?: string;
  minWords: number;
  maxWords?: number;
  startDate: string;
  endDate: string;
  status: string;
  _count?: { entries: number };
}

const statusLabels: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const typeLabels: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  special: "Special",
};

export function CompetitionCard({ competition }: { competition: CompetitionData }) {
  const isCompleted = competition.status === "completed";

  return (
    <Card className={isCompleted ? "opacity-70" : "hover:border-brand transition-colors"}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{competition.title}</CardTitle>
          <Badge className={statusLabels[competition.status] || statusLabels.upcoming}>
            {competition.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {competition.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{competition.description}</p>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {competition.genre && (
            <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand">
              {competition.genre}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-fg/5">
            {typeLabels[competition.type] || competition.type}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-fg/5">
            {competition.minWords.toLocaleString()}+ words
          </span>
          {competition.maxWords && (
            <span className="px-2 py-0.5 rounded-full bg-fg/5">
              Max {competition.maxWords.toLocaleString()} words
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            {new Date(competition.startDate).toLocaleDateString()} –{" "}
            {new Date(competition.endDate).toLocaleDateString()}
          </span>
          <span>{competition._count?.entries ?? 0} entries</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function EnterDialog({
  open,
  onOpenChange,
  competition,
  onEnter,
  isPending,
  userProjects,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competition: CompetitionData;
  onEnter: (projectId: string) => void;
  isPending: boolean;
  userProjects: { id: string; title: string; wordCount: number; isPublic: boolean }[];
}) {
  if (!open) return null;

  const eligibleProjects = userProjects.filter(
    (p) =>
      p.isPublic &&
      p.wordCount >= competition.minWords &&
      (!competition.maxWords || p.wordCount <= competition.maxWords)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-2">Enter Competition</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select a public project to enter into &quot;{competition.title}&quot;
        </p>

        {eligibleProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No eligible projects found. Make sure you have a public project with{" "}
            {competition.minWords.toLocaleString()}+ words.
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2">
            {eligibleProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => onEnter(project.id)}
                disabled={isPending}
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
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm rounded-md border border-fg/20 hover:bg-fg/5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
