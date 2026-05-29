import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { EnterCompetitionForm } from "./enter-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Competition Details — StoryForge",
};

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const typeLabels: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  special: "Special",
};

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { id } = await params;

  const competition = await prisma.competition.findUnique({
    where: { id },
    include: {
      entries: {
        include: {
          project: { select: { id: true, title: true, wordCount: true, description: true } },
        },
      },
    },
  });

  if (!competition) notFound();

  const userProjects = await prisma.project.findMany({
    where: { userId: user.id, isPublic: true },
    select: { id: true, title: true, wordCount: true, isPublic: true },
  });

  const userEntered = competition.entries.some((e) => e.userId === user.id);
  const isActive = competition.status === "active" || competition.status === "upcoming";

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/competitions" className="text-sm text-fg/40 hover:text-brand">
          ← Competitions
        </Link>
      </div>

      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-extrabold">{competition.title}</h1>
            <Badge className={statusColors[competition.status] || statusColors.upcoming}>
              {competition.status}
            </Badge>
          </div>
          {competition.description && (
            <p className="text-fg/60 max-w-2xl">{competition.description}</p>
          )}
        </div>
        {isActive && !userEntered && (
          <EnterCompetitionForm
            competitionId={competition.id}
            competitionTitle={competition.title}
            userProjects={userProjects}
            minWords={competition.minWords}
            maxWords={competition.maxWords ?? undefined}
            enteredProjectId={null}
          />
        )}
        {userEntered && (
          <span className="shrink-0 px-4 py-2 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-sm font-medium">
            ✓ Entered
          </span>
        )}
      </header>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-brand">
            {typeLabels[competition.type] || competition.type}
          </p>
          <p className="text-xs text-fg/40 mt-1">Type</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-brand">{competition.entries.length}</p>
          <p className="text-xs text-fg/40 mt-1">Entries</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-brand">{competition.minWords.toLocaleString()}+</p>
          <p className="text-xs text-fg/40 mt-1">Min Words</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-brand">{competition.genre || "Any"}</p>
          <p className="text-xs text-fg/40 mt-1">Genre</p>
        </Card>
      </div>

      <div className="flex gap-8 text-sm text-fg/60">
        <span>
          Starts:{" "}
          {new Date(competition.startDate).toLocaleDateString(undefined, { dateStyle: "long" })}
        </span>
        <span>
          Ends: {new Date(competition.endDate).toLocaleDateString(undefined, { dateStyle: "long" })}
        </span>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold border-b border-fg/10 pb-2">
          Entries ({competition.entries.length})
        </h2>
        {competition.entries.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-fg/40">No entries yet. Be the first!</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {competition.entries.map((entry) => (
              <Link key={entry.id} href={`/projects/${entry.project.id}`} className="block">
                <Card className="p-4 hover:border-brand transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{entry.project.title}</h3>
                      {entry.project.description && (
                        <p className="text-sm text-fg/60 line-clamp-2 mt-1">
                          {entry.project.description}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm text-fg/40 ml-4">
                      {entry.project.wordCount.toLocaleString()} words
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
