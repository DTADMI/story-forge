import Image from "next/image";
import Link from "next/link";
import HeaderUser from "@/components/header/User";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 h-14">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-display font-bold">
            <Image
              src="/images/StoryForge_logo.png"
              alt="StoryForge"
              width={24}
              height={24}
              className="object-contain"
            />
            <span className="hidden sm:inline">StoryForge</span>
          </Link>
          <nav className="hidden sm:flex gap-4 text-sm font-medium">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/feed"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Feed
            </Link>
            <Link
              href="/tutorial"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Tutorial
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </nav>
        </div>
        <HeaderUser />
      </header>
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
    </div>
  );
}
