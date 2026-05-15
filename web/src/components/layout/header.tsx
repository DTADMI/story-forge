import Link from "next/link";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { BarChart3, Activity, Trophy } from "lucide-react";

export async function Header() {
  const user = await getUser();

  let isUserAdmin = false;
  if (user) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });
      isUserAdmin = dbUser?.role === "admin";
    } catch {}
  }

  return (
    <header className="border-fg/10 bg-bg/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-brand text-lg font-extrabold">
            StoryForge
          </Link>
          <nav className="hidden gap-4 text-sm sm:flex">
            <Link href="/feed" className="hover:text-brand transition-colors">
              Feed
            </Link>
            <Link href="/world/galaxy" className="hover:text-brand transition-colors">
              Galaxy
            </Link>
            <Link href="/pricing" className="hover:text-brand transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-brand transition-colors">
              About
            </Link>
            <Link href="/faq" className="hover:text-brand transition-colors">
              FAQ
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          {user ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Link
                href="/feed/activity"
                className="text-xs hover:text-brand"
                title="Activity Feed"
              >
                <Activity className="h-4 w-4" />
              </Link>
              <Link href="/stats" className="text-xs hover:text-brand" title="Writing Stats">
                <BarChart3 className="h-4 w-4" />
              </Link>
              <Link href="/leaderboard" className="text-xs hover:text-brand" title="Leaderboard">
                <Trophy className="h-4 w-4" />
              </Link>
              {isUserAdmin && (
                <Link href="/admin/subscriptions" className="text-xs hover:text-brand" title="Admin">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="text-sm hover:text-brand">
                Dashboard
              </Link>
              <Link href="/profile" className="text-sm hover:text-brand">
                Profile
              </Link>
            </div>
          ) : (
            <Link href="/signin" className="text-sm hover:text-brand">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
