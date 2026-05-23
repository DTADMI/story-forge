import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/StoryForge_logo.png"
                alt="StoryForge"
                width={24}
                height={24}
                className="object-contain"
              />
              <h3 className="font-display font-semibold">StoryForge</h3>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              A gamified creative writing platform for novelists, screenwriters, and storytellers.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-semibold">Product</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/feed" className="hover:text-foreground transition-colors">
                Explore
              </Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/components-demo" className="hover:text-foreground transition-colors">
                Components
              </Link>
              <Link href="/download" className="hover:text-foreground transition-colors">
                Download
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-semibold">Company</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/faq" className="hover:text-foreground transition-colors">
                FAQ
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-semibold">Legal</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/not-found" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/not-found" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {year} StoryForge. All rights reserved.</p>
          <p>Built with Next.js, Supabase, and Prisma</p>
        </div>
      </div>
    </footer>
  );
}
