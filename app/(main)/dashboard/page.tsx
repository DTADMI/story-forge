import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  BookOpen,
  Users,
  MessageSquare,
  Target,
  BarChart3,
  Trophy,
  Flame,
  Bell,
  Globe,
  Droplets,
  Award,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const [
    projectCount,
    unreadMessages,
    unreadNotifications,
    streakData,
    inkBalance,
    badgeCount,
    goals,
    projectWordTotal,
  ] = await Promise.all([
    prisma.project.count({ where: { userId: user.id } }),
    prisma.message.count({ where: { receiverId: user.id, read: false } }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    prisma.progressLog.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
      take: 90,
      select: { timestamp: true },
    }),
    prisma.inkPot.findUnique({
      where: { userId: user.id },
      select: { balance: true },
    }),
    prisma.userBadge.count({ where: { userId: user.id } }),
    prisma.goal.findMany({ where: { userId: user.id } }),
    prisma.project.aggregate({ where: { userId: user.id }, _sum: { wordCount: true } }),
  ]);

  const days = new Set(streakData.map((l) => l.timestamp.toISOString().split("T")[0]));
  let streakCount = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(d.toISOString().split("T")[0])) streakCount++;
    else break;
  }

  // Get active goal progress
  const activeGoal = goals.find((g) => g.type === "words_per_day");
  let goalProgress = 0;
  if (activeGoal) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayLogs = await prisma.progressLog.aggregate({
      where: { userId: user.id, timestamp: { gte: todayStart } },
      _sum: { value: true },
    });
    goalProgress = todayLogs._sum.value ?? 0;
  }

  const totalWords = projectWordTotal._sum.wordCount ?? 0;

  const sections = [
    {
      label: "Writing",
      items: [
        {
          href: "/projects",
          label: "My Projects",
          desc: `${projectCount} project${projectCount !== 1 ? "s" : ""}`,
          icon: BookOpen,
        },
        { href: "/goals", label: "Writing Goals", desc: "Set daily targets", icon: Target },
        { href: "/stats", label: "Statistics", desc: `${streakCount}-day streak`, icon: BarChart3 },
        {
          href: "/leaderboard",
          label: "Leaderboard",
          desc: "Weekly rankings",
          icon: Trophy,
        },
      ],
    },
    {
      label: "World Building",
      items: [
        {
          href: "/world",
          label: "World Overview",
          desc: "Characters, locations, timeline",
          icon: Globe,
        },
        {
          href: "/world/galaxy",
          label: "Galaxy View",
          desc: "Interconnected relationship graph",
          icon: Globe,
        },
        {
          href: "/world/encyclopedia",
          label: "Encyclopedia",
          desc: "Lore, magic, cultures",
          icon: BookOpen,
        },
        {
          href: "/world/gallery",
          label: "Image Gallery",
          desc: "Visual references",
          icon: Globe,
        },
      ],
    },
    {
      label: "Social",
      items: [
        {
          href: "/messages",
          label: "Messages",
          desc: unreadMessages > 0 ? `${unreadMessages} unread` : "No new messages",
          icon: MessageSquare,
        },
        {
          href: "/notifications",
          label: "Notifications",
          desc: unreadNotifications > 0 ? `${unreadNotifications} unread` : "All caught up",
          icon: Bell,
        },
        { href: "/groups", label: "Groups", desc: "Writing communities", icon: Users },
        {
          href: "/feed/activity",
          label: "Activity Feed",
          desc: "Friends' updates",
          icon: Globe,
        },
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <p className="text-fg/60 mt-1">
          Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}. Keep the ink flowing.
        </p>
      </div>

      {/* Gamification Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-orange-500">{streakCount}</p>
          <p className="text-xs text-fg/40">Day Streak</p>
        </Card>
        <Card className="p-4 text-center">
          <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-blue-500">
            {(inkBalance?.balance ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-fg/40">Ink Balance</p>
        </Card>
        <Card className="p-4 text-center">
          <Award className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-yellow-500">{badgeCount}</p>
          <p className="text-xs text-fg/40">Badges</p>
        </Card>
        <Card className="p-4 text-center">
          <BarChart3 className="h-5 w-5 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-green-500">{totalWords.toLocaleString()}</p>
          <p className="text-xs text-fg/40">Total Words</p>
        </Card>
      </div>

      {/* Active Goal Progress */}
      {activeGoal && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-brand" />
              <span className="text-sm font-medium">
                Daily Goal: {activeGoal.target.toLocaleString()} words
              </span>
            </div>
            <span className="text-sm font-mono text-fg/50">
              {goalProgress.toLocaleString()} / {activeGoal.target.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-fg/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                goalProgress >= activeGoal.target ? "bg-green-500" : "bg-brand"
              }`}
              style={{ width: `${Math.min(100, (goalProgress / activeGoal.target) * 100)}%` }}
            />
          </div>
        </Card>
      )}

      {sections.map((section) => (
        <div key={section.label}>
          <h2 className="text-sm font-bold text-fg/40 uppercase tracking-wide mb-3">
            {section.label}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {section.items.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="p-4 hover:bg-fg/3 transition-colors h-full">
                  <item.icon className="h-5 w-5 text-fg/30 mb-2" />
                  <h3 className="font-medium text-sm">{item.label}</h3>
                  <p className="text-xs text-fg/40 mt-0.5">{item.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
