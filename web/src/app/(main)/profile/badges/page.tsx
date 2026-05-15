import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { AchievementToast } from "@/components/gamification/achievement-toast";
import {
  BadgeQuillBronze,
  BadgeScrollSilver,
  BadgeBookGold,
  BadgeLibraryPlatinum,
  BadgeGalaxyDiamond,
  BadgeFire,
  BadgeCrown,
} from "@/components/assets/badges";
import { Award } from "lucide-react";

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  quill_bronze: BadgeQuillBronze,
  scroll_silver: BadgeScrollSilver,
  book_gold: BadgeBookGold,
  library_platinum: BadgeLibraryPlatinum,
  galaxy_diamond: BadgeGalaxyDiamond,
  fire: BadgeFire,
  crown: BadgeCrown,
};

export default async function BadgesPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const [earnedBadges, allBadges] = await Promise.all([
    prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
      orderBy: { awardedAt: "desc" },
    }),
    prisma.badge.findMany({
      orderBy: { threshold: "asc" },
    }),
  ]);

  const earnedSet = new Set(earnedBadges.map((ub) => ub.badgeId));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <AchievementToast />

      <h1 className="text-3xl font-extrabold mb-2">Badges</h1>
      <p className="text-fg/60 mb-8">Achievements earned through your writing journey.</p>

      {allBadges.length === 0 ? (
        <EmptyState
          icon={<Award className="h-6 w-6 text-fg/30" />}
          title="No badges available"
          description="Badges will appear here as you write more."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {allBadges.map((badge) => {
            const isEarned = earnedSet.has(badge.id);
            const earnedEntry = earnedBadges.find((eb) => eb.badgeId === badge.id);
            const BadgeIcon = BADGE_ICONS[badge.name];
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors ${
                  isEarned
                    ? "border-brand/20 bg-brand/5"
                    : "border-fg/10 bg-fg/5 opacity-40"
                }`}
              >
                {BadgeIcon ? (
                  <BadgeIcon size={48} />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fg/10">
                    <Award className={`h-6 w-6 ${isEarned ? "text-brand" : "text-fg/20"}`} />
                  </div>
                )}
                <p
                  className={`text-xs font-semibold ${
                    isEarned ? "text-brand" : "text-fg/30"
                  }`}
                >
                  {badge.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </p>
                {badge.description && (
                  <p className="text-xs text-fg/40">{badge.description}</p>
                )}
                {!isEarned && badge.threshold > 0 && (
                  <p className="text-xs text-fg/20">
                    {badge.type === "total_words"
                      ? `${badge.threshold.toLocaleString()} words`
                      : badge.type === "streak"
                      ? `${badge.threshold} day streak`
                      : `Threshold: ${badge.threshold}`}
                  </p>
                )}
                {earnedEntry && (
                  <p className="text-xs text-fg/30">
                    {new Date(earnedEntry.awardedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
