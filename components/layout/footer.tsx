import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">StoryForge</h3>
            <p className="text-sm text-muted-foreground">
              A gamified creative writing platform for novelists, screenwriters, and storytellers.
            </p>
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Product</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/feed" className="hover:text-foreground transition-colors">
                Explore
              </Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Support</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/faq" className="hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Link href="/download" className="hover:text-foreground transition-colors">
                Download
              </Link>
            </nav>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          &copy; {year} StoryForge. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
