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
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const [projectCount, unreadMessages, unreadNotifications, streak] = await Promise.all([
    prisma.project.count({ where: { userId: user.id } }),
    prisma.message.count({ where: { receiverId: user.id, read: false } }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    prisma.progressLog.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
      take: 90,
      select: { timestamp: true },
    }),
  ]);

  const days = new Set(streak.map((l) => l.timestamp.toISOString().split("T")[0]));
  let streakCount = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(d.toISOString().split("T")[0])) streakCount++;
    else break;
  }

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
        {
          href: "/projects/new" in String ? "/projects" : "/projects",
          label: "New Project",
          desc: "Start writing",
          icon: BookOpen,
        },
        { href: "/goals", label: "Writing Goals", desc: "Set daily targets", icon: Target },
        { href: "/stats", label: "Statistics", desc: `${streakCount}-day streak`, icon: BarChart3 },
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
        { href: "/world/gallery", label: "Image Gallery", desc: "Visual references", icon: Globe },
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
        { href: "/feed/activity", label: "Activity Feed", desc: "Friends' updates", icon: Globe },
        { href: "/leaderboard", label: "Leaderboard", desc: "Weekly rankings", icon: Trophy },
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
        {streakCount > 0 && (
          <div className="inline-flex items-center gap-1 mt-2 text-sm text-orange-500 font-medium">
            <Flame className="h-4 w-4" />
            {streakCount}-day writing streak!
          </div>
        )}
      </div>

      {sections.map((section) => (
        <div key={section.label}>
          <h2 className="text-sm font-bold text-fg/40 uppercase tracking-wide mb-3">
            {section.label}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
