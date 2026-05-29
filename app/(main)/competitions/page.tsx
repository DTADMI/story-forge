import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Competitions — StoryForge",
  description: "Browse and enter writing competitions",
};

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
  _count: { entries: number };
}

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

async function getCompetitions(): Promise<CompetitionData[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/competitions`,
    {
      headers: { cookie: "" },
    }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function CompetitionsPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const competitions = await getCompetitions();
  const activeCompetitions = competitions.filter(
    (c) => c.status === "active" || c.status === "upcoming"
  );
  const pastCompetitions = competitions.filter((c) => c.status === "completed");

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Writing Competitions</h1>
          <p className="text-fg/60 mt-1">Enter your stories and compete with other writers.</p>
        </div>
        <Link
          href="/competitions/winners"
          className="px-4 py-2 text-sm border border-brand/30 text-brand rounded-md hover:bg-brand/5"
        >
          Past Winners
        </Link>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-bold border-b border-fg/10 pb-2">
          Active Competitions ({activeCompetitions.length})
        </h2>
        {activeCompetitions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-fg/40">No active competitions. Check back soon!</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeCompetitions.map((comp) => (
              <Link key={comp.id} href={`/competitions/${comp.id}`} className="block">
                <Card className="p-5 hover:border-brand hover:bg-brand/[0.02] transition-all h-full">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold">{comp.title}</h3>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusColors[comp.status] || ""}`}
                    >
                      {comp.status}
                    </span>
                  </div>
                  {comp.description && (
                    <p className="text-sm text-fg/60 line-clamp-2 mb-3">{comp.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {comp.genre && (
                      <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-medium">
                        {comp.genre}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-fg/5 text-fg/60 text-[10px]">
                      {typeLabels[comp.type] || comp.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-fg/5 text-fg/60 text-[10px]">
                      {comp.minWords.toLocaleString()}+ words
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-fg/40 pt-2 border-t border-fg/5">
                    <span>
                      {new Date(comp.startDate).toLocaleDateString()} –{" "}
                      {new Date(comp.endDate).toLocaleDateString()}
                    </span>
                    <span>{comp._count?.entries ?? 0} entries</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {pastCompetitions.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold border-b border-fg/10 pb-2">
            Past Competitions ({pastCompetitions.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {pastCompetitions.slice(0, 4).map((comp) => (
              <Link key={comp.id} href={`/competitions/${comp.id}`} className="block">
                <Card className="p-5 hover:border-fg/20 transition-all h-full opacity-70">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold">{comp.title}</h3>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      Completed
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-fg/40 pt-2 border-t border-fg/5">
                    <span>
                      {new Date(comp.startDate).toLocaleDateString()} –{" "}
                      {new Date(comp.endDate).toLocaleDateString()}
                    </span>
                    <span>{comp._count?.entries ?? 0} entries</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
