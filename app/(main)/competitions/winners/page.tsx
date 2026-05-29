import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Competition Winners — StoryForge",
  description: "Past competition winners and top entries",
};

interface CompetitionData {
  id: string;
  title: string;
  description?: string;
  type: string;
  genre?: string;
  startDate: string;
  endDate: string;
  status: string;
  _count: { entries: number };
}

async function getPastCompetitions(): Promise<CompetitionData[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/competitions?status=completed`,
    { headers: { cookie: "" } }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function WinnersPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const competitions = await getPastCompetitions();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-10">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/competitions" className="text-sm text-fg/40 hover:text-brand">
          ← Competitions
        </Link>
      </div>

      <header>
        <h1 className="text-2xl font-extrabold">Past Competition Winners</h1>
        <p className="text-fg/60 mt-1">See who won previous writing competitions.</p>
      </header>

      {competitions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-3">🏆</div>
          <h2 className="text-lg font-bold mb-1">No past competitions yet</h2>
          <p className="text-fg/40 text-sm">
            Completed competitions and their winners will appear here.
          </p>
          <Link
            href="/competitions"
            className="inline-block mt-4 text-sm text-brand font-medium hover:underline"
          >
            Browse active competitions
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {competitions.map((comp) => (
            <Link key={comp.id} href={`/competitions/${comp.id}`} className="block">
              <Card className="p-5 hover:border-brand transition-all h-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold">{comp.title}</h3>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    Completed
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
                    {comp._count?.entries ?? 0} entries
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-fg/40 pt-2 border-t border-fg/5">
                  <span>
                    {new Date(comp.startDate).toLocaleDateString()} –{" "}
                    {new Date(comp.endDate).toLocaleDateString()}
                  </span>
                  <span className="text-brand font-medium">View Results →</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
