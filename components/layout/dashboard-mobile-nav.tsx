"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getDashboardSections } from "@/components/layout/dashboard-nav";
import { cn } from "@/lib/utils";

interface DashboardMobileNavProps {
  isAdmin?: boolean;
  onClose?: () => void;
  onSignOut?: () => void;
}

export function DashboardMobileNav({
  isAdmin = false,
  onClose,
  onSignOut,
}: DashboardMobileNavProps) {
  const pathname = usePathname();
  const sections = getDashboardSections(isAdmin);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Image
            src="/images/StoryForge_logo.png"
            alt="StoryForge"
            width={38}
            height={38}
            className="rounded-md object-contain"
          />
          <div>
            <p className="font-display text-base font-semibold">StoryForge</p>
            <p className="text-xs text-muted-foreground">Writer workspace</p>
          </div>
        </div>
      </div>

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
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active ? item.activeColor : cn("text-muted-foreground", item.hoverColor)
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.title}
                  </Link>
                );
              })}
            </div>
            {index < sections.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </nav>

      {onSignOut && (
        <div className="border-t border-border p-3">
          <button
            onClick={() => {
              onClose?.();
              onSignOut();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
