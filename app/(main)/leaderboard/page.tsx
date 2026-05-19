import { Suspense } from "react";
import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { SkeletonList } from "@/components/skeleton";
import { Trophy, Medal, Flame } from "lucide-react";
import Link from "next/link";

export default async function LeaderboardPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 space-y-8">
      <h1 className="text-2xl font-extrabold">Leaderboard</h1>
      <Suspense fallback={<SkeletonList count={10} />}>
        <LeaderboardContent userId={user.id} />
      </Suspense>
    </main>
  );
}

async function LeaderboardContent({ userId }: { userId: string }) {
  const { prisma } = await import("@/lib/prisma");

  const dateFilter = new Date(
    // eslint-disable-next-line react-hooks/purity
    Date.now() - 7 * 24 * 60 * 60 * 1000
  );
  const logs = await prisma.progressLog.groupBy({
    by: ["userId"],
    where: { timestamp: { gte: dateFilter } },
    _sum: { value: true },
  });

  const userIds = logs.map((l) => l.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, username: true, image: true },
  });

  const leaderboard = logs
    .map((l) => {
      const u = users.find((u) => u.id === l.userId);
      return {
        userId: l.userId,
        name: u?.name || u?.username || "Anonymous",
        username: u?.username,
        words: l._sum.value || 0,
      };
    })
    .filter((e) => e.words > 0)
    .sort((a, b) => b.words - a.words)
    .slice(0, 30)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  if (leaderboard.length === 0) {
    return (
      <Card className="p-8">
        <EmptyState
          title="No entries yet"
          description="Start writing to appear on the leaderboard! Weekly rankings reset every Monday."
        />
      </Card>
    );
  }

  const rankIcons = [Trophy, Medal, Flame];

  return (
    <Card className="overflow-hidden">
      <div className="p-3 border-b border-fg/10 bg-fg/3">
        <span className="text-xs font-medium text-fg/50 uppercase tracking-wide">
          Weekly Top Writers
        </span>
      </div>
      <div className="divide-y divide-fg/5">
        {leaderboard.map((entry) => {
          const Icon = entry.rank <= 3 ? rankIcons[entry.rank - 1] : null;
          const isMe = entry.userId === userId;

          return (
            <Link
              key={entry.userId}
              href={`/users/${entry.userId}`}
              className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-fg/3 transition-colors ${isMe ? "bg-brand/5" : ""}`}
            >
              <span className="w-8 text-center font-mono font-bold text-fg/30">
                {entry.rank <= 3 && Icon ? (
                  <Icon
                    className={`h-4 w-4 mx-auto ${entry.rank === 1 ? "text-yellow-500" : entry.rank === 2 ? "text-gray-400" : "text-orange-400"}`}
                  />
                ) : (
                  entry.rank
                )}
              </span>
              <span className={`flex-1 truncate ${isMe ? "font-bold text-brand" : ""}`}>
                {entry.name}
                {isMe && <span className="text-xs text-fg/40 ml-1">(you)</span>}
              </span>
              <span className="font-mono text-fg/50 shrink-0">
                {entry.words.toLocaleString()} words
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
