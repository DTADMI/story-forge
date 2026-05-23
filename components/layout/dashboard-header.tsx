"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface DashboardHeaderProps {
  onMenuToggle: () => void;
}

interface UserInfo {
  id: string;
  email?: string;
  user_metadata?: { name?: string };
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user as unknown as UserInfo);
      }
    });
  }, []);

  const displayName = useMemo(
    () => user?.user_metadata?.name || user?.email?.split("@")[0] || "Writer",
    [user]
  );

  async function handleSignOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  function handleSearchSubmit() {
    const query = searchValue.trim();
    if (!query) return;
    router.push(`/world/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="flex h-full items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/images/StoryForge_logo.png"
              alt="StoryForge"
              width={36}
              height={36}
              className="rounded-md object-contain"
            />
            <div className="hidden sm:block">
              <p className="font-display text-sm font-semibold">StoryForge</p>
              <p className="text-xs text-muted-foreground">Writer workspace</p>
            </div>
          </Link>
        </div>

        <div className="hidden max-w-lg flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearchSubmit();
              }}
              placeholder="Search your world, lore, and story systems..."
              className="h-10 w-full rounded-md border border-input bg-background py-2 pr-4 pl-10 text-sm shadow-xs transition-all duration-200 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/messages"
            className="hidden rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            aria-label="Messages"
          >
            <MessageSquare className="h-4 w-4" />
          </Link>
          <NotificationBell />
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full border border-border px-1.5 py-1 pr-2 transition-colors hover:bg-muted"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden max-w-[96px] truncate text-sm font-medium sm:inline">
                {displayName}
              </span>
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute top-full right-0 z-20 mt-2 w-56 rounded-lg border border-border bg-card py-1 shadow-lg">
                  <div className="border-b border-border px-3 py-2">
                    <p className="truncate text-xs font-medium">{displayName}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/projects"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <BookOpen className="h-4 w-4" />
                    Projects
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/profile/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <div className="mt-1 border-t border-border pt-1">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
