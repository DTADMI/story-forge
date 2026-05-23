"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardMobileNav } from "@/components/layout/dashboard-mobile-nav";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Sheet } from "@/components/ui/sheet";

interface DashboardShellProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export function DashboardShell({ children, isAdmin = false }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  return (
    <div className="min-h-svh bg-muted/20">
      <DashboardHeader onMenuToggle={() => setMobileNavOpen(true)} />

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen} side="left">
        <DashboardMobileNav
          isAdmin={isAdmin}
          onClose={() => setMobileNavOpen(false)}
          onSignOut={handleSignOut}
        />
      </Sheet>

      <DashboardSidebar isAdmin={isAdmin} />

      <main id="main-content" tabIndex={-1} className="pt-16 md:pl-64">
        <div className="min-h-[calc(100svh-4rem)] overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
