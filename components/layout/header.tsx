"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createBrowserClient } from "@/lib/supabase/client";
import { Sun, Moon, Menu, X, LayoutDashboard, User, Settings, LogOut } from "lucide-react";

interface UserInfo {
  id: string;
  email?: string;
  user_metadata?: { name?: string };
}

export function Header() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-bold text-foreground hover:text-primary transition-colors"
        >
          <Image
            src="/images/StoryForge_logo.png"
            alt="StoryForge"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="hidden sm:inline">StoryForge</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/feed"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/pricing"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>

          {user ? (
            <>
              {/* Auth nav links */}
              <Link
                href="/dashboard"
                className="hidden rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors sm:inline-flex items-center gap-1.5"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{displayName}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-20 w-48 rounded-lg border border-border bg-card shadow-lg py-1">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-xs font-medium truncate">{displayName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
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
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors sm:inline-flex"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-gradient-to-r from-brand-1 to-brand-2 px-4 py-1.5 text-sm font-medium text-white shadow-sm shadow-brand-2/20 hover:shadow-md hover:shadow-brand-2/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3">
            <Link
              href="/feed"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Explore
            </Link>
            <Link
              href="/pricing"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            {user ? (
              <>
                <div className="h-px bg-border my-1" />
                <Link
                  href="/dashboard"
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="h-px bg-border my-1" />
                <Link
                  href="/signin"
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
