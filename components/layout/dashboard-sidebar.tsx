"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { getDashboardSections } from "@/components/layout/dashboard-nav";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isAdmin?: boolean;
}

export function DashboardSidebar({ isAdmin = false }: DashboardSidebarProps) {
  const pathname = usePathname();
  const sections = getDashboardSections(isAdmin);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="fixed top-16 left-0 z-30 hidden h-[calc(100svh-4rem)] w-64 border-r border-border bg-card/95 backdrop-blur md:flex md:flex-col">
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section, index) => (
          <div key={section.label} className="mb-4">
            <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {section.label}
            </h3>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      active ? item.activeColor : cn("text-muted-foreground", item.hoverColor)
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
            {index < sections.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </nav>
    </aside>
  );
}
