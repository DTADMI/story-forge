import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { BarChart3, Flame, BookOpen, Trophy, Target } from "lucide-react";

export default async function StatsPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const [
    totalWords,
    projectCount,
    characterCount,
    badgeCount,
    currentStreakData,
    recentLogs,
    goals,
    projects,
  ] = await Promise.all([
    prisma.project.aggregate({ where: { userId: user.id }, _sum: { wordCount: true } }),
    prisma.project.count({ where: { userId: user.id } }),
    prisma.character.count({ where: { userId: user.id } }),
    prisma.userBadge.count({ where: { userId: user.id } }),
    prisma.progressLog.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
      take: 90,
    }),
    prisma.progressLog.findMany({
      where: {
        userId: user.id,
        timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.goal.count({ where: { userId: user.id } }),
    prisma.project.findMany({
      where: { userId: user.id },
      select: { genre: true, wordCount: true },
    }),
  ]);

  // Streak calculation
  const daysWithProgress = new Set(
    currentStreakData.map((l) => l.timestamp.toISOString().split("T")[0])
  );
  let currentStreak = 0;
  let longestStreak = 0;
  let run = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (daysWithProgress.has(d.toISOString().split("T")[0])) {
      run++;
      if (run > longestStreak) longestStreak = run;
    } else {
      if (i === 0) currentStreak = run;
      run = 0;
    }
  }
  if (currentStreak === 0) currentStreak = run;

  // 30-day trend
  const trendMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    trendMap.set(d.toISOString().split("T")[0], 0);
  }
  for (const log of recentLogs) {
    const day = log.timestamp.toISOString().split("T")[0];
    trendMap.set(day, (trendMap.get(day) || 0) + log.value);
  }
  const trend = Array.from(trendMap.entries())
    .map(([date, words]) => ({ date, words }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const maxDaily = Math.max(...trend.map((t) => t.words), 1);

  // Genre breakdown
  const genres: Record<string, number> = {};
  for (const p of projects) {
    const g = p.genre || "Uncategorized";
    genres[g] = (genres[g] || 0) + p.wordCount;
  }

  const stats = [
    {
      label: "Total Words",
      value: (totalWords._sum.wordCount || 0).toLocaleString(),
      icon: BookOpen,
    },
    { label: "Projects", value: String(projectCount), icon: BookOpen },
    { label: "Characters", value: String(characterCount), icon: BookOpen },
    { label: "Badges", value: String(badgeCount), icon: Trophy },
    { label: "Current Streak", value: `${currentStreak} days`, icon: Flame },
    { label: "Longest Streak", value: `${longestStreak} days`, icon: Flame },
    { label: "Goals Set", value: String(goals), icon: Target },
    {
      label: "Avg Words/Project",
      value:
        projectCount > 0
          ? Math.round((totalWords._sum.wordCount || 0) / projectCount).toLocaleString()
          : "0",
      icon: BarChart3,
    },
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">
      <h1 className="text-2xl font-extrabold">Writing Statistics</h1>

      {projectCount === 0 ? (
        <Card className="p-8">
          <EmptyState
            title="No stats yet"
            description="Start writing your first project to see statistics and trends."
            action={{ label: "Create a Project", href: "/projects" }}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s) => (
              <Card key={s.label} className="p-4 text-center">
                <s.icon className="h-4 w-4 mx-auto text-fg/30 mb-1" />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-fg/40">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* 30-day word count chart (simple bar) */}
          <Card className="p-4">
            <h2 className="font-bold mb-4">30-Day Word Count</h2>
            <div className="flex items-end gap-0.5 h-32">
              {trend.map((t) => (
                <div
                  key={t.date}
                  className="flex-1 flex flex-col items-center gap-1 group relative"
                >
                  <div
                    className="w-full bg-brand/60 hover:bg-brand rounded-t transition-colors"
                    style={{
                      height: `${(t.words / maxDaily) * 100}%`,
                      minHeight: t.words > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-fg/40">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </Card>

          {/* Genre breakdown */}
          {Object.keys(genres).length > 0 && (
            <Card className="p-4">
              <h2 className="font-bold mb-3">Words by Genre</h2>
              <div className="space-y-2">
                {Object.entries(genres)
                  .sort(([, a], [, b]) => b - a)
                  .map(([genre, words]) => (
                    <div key={genre} className="flex items-center gap-2 text-sm">
                      <span className="w-24 truncate">{genre}</span>
                      <div className="flex-1 h-4 bg-fg/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand/50 rounded-full"
                          style={{ width: `${(words / (totalWords._sum.wordCount || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-fg/40 w-16 text-right">
                        {words.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </>
      )}
    </main>
  );
}
