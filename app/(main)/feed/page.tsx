import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Activity, BookOpen, Trophy, Flame, Target, Users } from "lucide-react";

const ACTIVITY_ICONS: Record<string, typeof Activity> = {
  project_created: BookOpen,
  project_published: BookOpen,
  badge_earned: Trophy,
  streak_milestone: Flame,
  goal_complete: Target,
  follow_gained: Users,
  comment_received: Activity,
};

type ActivityMetadata = Record<string, unknown> | null;

const ACTIVITY_LABELS: Record<string, (meta?: ActivityMetadata) => string> = {
  project_created: (m) => `started a new project: "${m?.title || "Untitled"}"`,
  project_published: (m) => `published "${m?.title || "a project"}" (${m?.wordCount || 0} words)`,
  badge_earned: (m) => `earned the "${m?.badgeName || "Unknown"}" badge!`,
  streak_milestone: (m) => `reached a ${m?.streakDays || 0}-day writing streak!`,
  goal_complete: () => `completed their daily writing goal!`,
  follow_gained: () => `gained a new follower`,
  comment_received: (m) =>
    `${m?.commenterName || "Someone"} commented on "${m?.projectTitle || "a project"}"`,
};

export default async function ActivityFeedPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 space-y-6">
      <h1 className="text-2xl font-extrabold">Activity Feed</h1>
      <ActivityFeedList />
    </main>
  );
}

async function ActivityFeedList() {
  const user = await getUser();
  if (!user) return null;

  const { prisma } = await import("@/lib/prisma");

  const following = await prisma.follow.findMany({
    where: { followerId: user.id },
    select: { followeeId: true },
  });
  const followeeIds = following.map((f) => f.followeeId);
  followeeIds.push(user.id);

  const activities = await prisma.activity.findMany({
    where: { userId: { in: followeeIds } },
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (activities.length === 0) {
    return (
      <Card className="p-8">
        <EmptyState
          title="No activity yet"
          description="Follow other writers to see their writing activity here."
          action={{ label: "Discover Writers", href: "/feed" }}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((a) => {
        const Icon = ACTIVITY_ICONS[a.type] || Activity;
        const label = (ACTIVITY_LABELS[a.type] || (() => a.type))(a.metadata as ActivityMetadata);

        return (
          <Card key={a.id} className="p-4 flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <Icon className="h-5 w-5 text-fg/30" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 flex-wrap text-sm">
                <a href={`/users/${a.userId}`} className="font-medium hover:text-brand">
                  {a.user.username || a.user.name || "A writer"}
                </a>
                <span className="text-fg/60">{label}</span>
              </div>
              <p className="text-xs text-fg/40 mt-0.5">
                {new Date(a.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
