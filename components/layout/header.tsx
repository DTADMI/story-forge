import Link from "next/link";
import { BookOpen, Menu, X } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-bold text-brand-1 dark:text-primary"
        >
          <BookOpen className="h-5 w-5" />
          <span>StoryForge</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/feed" className="text-foreground/70 hover:text-foreground transition-colors">
            Explore
          </Link>
          <Link
            href="/pricing"
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="hidden rounded-md px-4 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors sm:inline-flex"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-gradient-to-r from-brand-1 to-brand-2 px-4 py-1.5 text-sm font-medium text-white shadow-sm shadow-brand-2/20 hover:shadow-md hover:shadow-brand-2/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
