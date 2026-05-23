"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Globe,
  MessageSquare,
  Bell,
  Users,
  Target,
  BarChart3,
  Trophy,
  Settings,
  HelpCircle,
  User,
  Sparkles,
  MapPin,
  Clock,
  Library,
  Building2,
  Dna,
  Languages,
  Wand2,
  Church,
  Share2,
  Download,
  Search,
  Images,
  Shield,
  Flag,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleClick = () => {
    onClose?.();
  };

  const mainSections = [
    {
      label: "Writing",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "My Projects", href: "/projects", icon: BookOpen },
        { title: "Writing Goals", href: "/goals", icon: Target },
        { title: "Statistics", href: "/stats", icon: BarChart3 },
        { title: "Leaderboard", href: "/leaderboard", icon: Trophy },
      ],
    },
    {
      label: "World Building",
      items: [
        { title: "World Overview", href: "/world", icon: Globe },
        { title: "Characters", href: "/world/characters", icon: Users },
        { title: "Locations", href: "/world/locations", icon: MapPin },
        { title: "Timeline", href: "/world/timeline", icon: Clock },
        { title: "Organizations", href: "/world/organizations", icon: Building2 },
        { title: "Species", href: "/world/species", icon: Dna },
        { title: "Dialogues", href: "/world/dialogues", icon: MessageSquare },
        { title: "Encyclopedia", href: "/world/encyclopedia", icon: Library },
        { title: "Calendars", href: "/world/calendar", icon: Clock },
        { title: "Eras", href: "/world/era", icon: Clock },
        { title: "Languages", href: "/world/language", icon: Languages },
        { title: "Magic Systems", href: "/world/magic", icon: Wand2 },
        { title: "Religions", href: "/world/religion", icon: Church },
        { title: "Galaxy View", href: "/world/galaxy", icon: Sparkles },
        { title: "Image Gallery", href: "/world/gallery", icon: Images },
      ],
    },
    {
      label: "Social",
      items: [
        { title: "Messages", href: "/messages", icon: MessageSquare },
        { title: "Notifications", href: "/notifications", icon: Bell },
        { title: "Groups", href: "/groups", icon: Users },
        { title: "World Search", href: "/world/search", icon: Search },
        { title: "Shared Worlds", href: "/world/shared", icon: Share2 },
        { title: "Export", href: "/world/export", icon: Download },
      ],
    },
    {
      label: "Account",
      items: [
        { title: "Profile", href: "/profile", icon: User },
        { title: "Badges", href: "/profile/badges", icon: Trophy },
        { title: "Settings", href: "/profile/settings", icon: Settings },
        { title: "Help & FAQ", href: "/faq", icon: HelpCircle },
      ],
    },
  ];

  const adminSection = isAdmin
    ? [
        {
          label: "Admin",
          items: [
            { title: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
            { title: "Users", href: "/admin/users", icon: Users },
            { title: "Moderation", href: "/admin/moderation", icon: Shield },
            { title: "Feature Flags", href: "/admin/flags", icon: Flag },
            { title: "Subscriptions", href: "/admin/subscriptions", icon: Sparkles },
            { title: "Audit Log", href: "/admin/audit", icon: Clock },
          ],
        },
      ]
    : [];

  const allSections = [...mainSections, ...adminSection];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Image
          src="/images/StoryForge_logo.png"
          alt="StoryForge"
          width={36}
          height={36}
          className="object-contain"
        />
        <span className="font-display font-bold text-lg">
          <span className="gradient-text bg-gradient-to-r from-brand-1 to-brand-2">StoryForge</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {allSections.map((section, sectionIdx) => (
          <div key={section.label} className="mb-4">
            <h3 className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </h3>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleClick}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} />
                    {item.title}
                  </Link>
                );
              })}
            </div>
            {sectionIdx < allSections.length - 1 && <Separator className="mt-3" />}
          </div>
        ))}
      </nav>

      {onSignOut && (
        <div className="p-3 border-t border-border">
          <button
            onClick={() => {
              handleClick();
              onSignOut();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
