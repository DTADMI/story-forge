"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  Menu,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Bell,
  MessageSquare,
  BookOpen,
} from "lucide-react";

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user as unknown as UserInfo);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Writer";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-display font-bold text-foreground hover:text-primary transition-colors"
        >
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">StoryForge</span>
        </Link>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Quick actions */}
        <Link
          href="/messages"
          className="rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors hidden sm:inline-flex"
          aria-label="Messages"
        >
          <MessageSquare className="h-4 w-4" />
        </Link>
        <Link
          href="/notifications"
          className="rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors hidden sm:inline-flex"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Link>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline max-w-[80px] truncate text-sm">{displayName}</span>
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-20 w-48 rounded-lg border border-border bg-card shadow-lg py-1">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-medium truncate">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link
                  href="/profile/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors md:hidden"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
