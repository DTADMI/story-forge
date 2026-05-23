"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardMobileNav } from "@/components/layout/dashboard-mobile-nav";
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
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuToggle={() => setMobileNavOpen(true)} />

      {/* Mobile navigation drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen} side="left">
        <DashboardMobileNav
          isAdmin={isAdmin}
          onClose={() => setMobileNavOpen(false)}
          onSignOut={handleSignOut}
        />
      </Sheet>

      {/* Desktop sidebar */}
      <DashboardSidebar isAdmin={isAdmin} />

      {/* Main content */}
      <main id="main-content" className="min-h-[calc(100vh-3.5rem)] pt-14 md:ml-60">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
