import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Church,
  Clock,
  Dna,
  Download,
  Flag,
  Globe,
  HelpCircle,
  Images,
  Languages,
  LayoutDashboard,
  Library,
  MapPin,
  MessageSquare,
  Search,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Target,
  Trophy,
  User,
  Users,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { isEnabledSync } from "@/lib/flags";

export interface DashboardNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  hoverColor: string;
  activeColor: string;
}

export interface DashboardNavSection {
  label: string;
  items: DashboardNavItem[];
}

const mainSections: DashboardNavSection[] = [
  {
    label: "Writing",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        hoverColor: "hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-300",
        activeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
      },
      {
        title: "My Projects",
        href: "/projects",
        icon: BookOpen,
        hoverColor: "hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-300",
        activeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-200",
      },
      {
        title: "Writing Goals",
        href: "/goals",
        icon: Target,
        hoverColor: "hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300",
        activeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-200",
      },
      {
        title: "Statistics",
        href: "/stats",
        icon: BarChart3,
        hoverColor: "hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-300",
        activeColor: "bg-violet-500/15 text-violet-700 dark:text-violet-200",
      },
      {
        title: "Leaderboard",
        href: "/leaderboard",
        icon: Trophy,
        hoverColor: "hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300",
        activeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-200",
      },
    ],
  },
  {
    label: "World Building",
    items: [
      {
        title: "World Overview",
        href: "/world",
        icon: Globe,
        hoverColor: "hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-300",
        activeColor: "bg-sky-500/15 text-sky-700 dark:text-sky-200",
      },
      {
        title: "Characters",
        href: "/world/characters",
        icon: Users,
        hoverColor: "hover:bg-pink-500/10 hover:text-pink-700 dark:hover:text-pink-300",
        activeColor: "bg-pink-500/15 text-pink-700 dark:text-pink-200",
      },
      {
        title: "Locations",
        href: "/world/locations",
        icon: MapPin,
        hoverColor: "hover:bg-orange-500/10 hover:text-orange-700 dark:hover:text-orange-300",
        activeColor: "bg-orange-500/15 text-orange-700 dark:text-orange-200",
      },
      {
        title: "Timeline",
        href: "/world/timeline",
        icon: Clock,
        hoverColor: "hover:bg-cyan-500/10 hover:text-cyan-700 dark:hover:text-cyan-300",
        activeColor: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-200",
      },
      {
        title: "Organizations",
        href: "/world/organizations",
        icon: Building2,
        hoverColor: "hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-300",
        activeColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-200",
      },
      {
        title: "Species",
        href: "/world/species",
        icon: Dna,
        hoverColor: "hover:bg-lime-500/10 hover:text-lime-700 dark:hover:text-lime-300",
        activeColor: "bg-lime-500/15 text-lime-700 dark:text-lime-200",
      },
      {
        title: "Dialogues",
        href: "/world/dialogues",
        icon: MessageSquare,
        hoverColor: "hover:bg-fuchsia-500/10 hover:text-fuchsia-700 dark:hover:text-fuchsia-300",
        activeColor: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-200",
      },
      {
        title: "Encyclopedia",
        href: "/world/encyclopedia",
        icon: Library,
        hoverColor: "hover:bg-slate-500/10 hover:text-slate-700 dark:hover:text-slate-300",
        activeColor: "bg-slate-500/15 text-slate-700 dark:text-slate-200",
      },
      {
        title: "Calendars",
        href: "/world/calendar",
        icon: Clock,
        hoverColor: "hover:bg-teal-500/10 hover:text-teal-700 dark:hover:text-teal-300",
        activeColor: "bg-teal-500/15 text-teal-700 dark:text-teal-200",
      },
      {
        title: "Eras",
        href: "/world/era",
        icon: Clock,
        hoverColor: "hover:bg-cyan-500/10 hover:text-cyan-700 dark:hover:text-cyan-300",
        activeColor: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-200",
      },
      {
        title: "Languages",
        href: "/world/language",
        icon: Languages,
        hoverColor: "hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300",
        activeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
      },
      {
        title: "Magic Systems",
        href: "/world/magic",
        icon: Wand2,
        hoverColor: "hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-300",
        activeColor: "bg-violet-500/15 text-violet-700 dark:text-violet-200",
      },
      {
        title: "Religions",
        href: "/world/religion",
        icon: Church,
        hoverColor: "hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300",
        activeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-200",
      },
      {
        title: "Galaxy View",
        href: "/world/galaxy",
        icon: Sparkles,
        hoverColor: "hover:bg-purple-500/10 hover:text-purple-700 dark:hover:text-purple-300",
        activeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-200",
      },
      {
        title: "Image Gallery",
        href: "/world/gallery",
        icon: Images,
        hoverColor: "hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300",
        activeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-200",
      },
    ],
  },
  {
    label: "Social",
    items: [
      {
        title: "Messages",
        href: "/messages",
        icon: MessageSquare,
        hoverColor: "hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-300",
        activeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-200",
      },
      {
        title: "Notifications",
        href: "/notifications",
        icon: Bell,
        hoverColor: "hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-300",
        activeColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-200",
      },
      {
        title: "Groups",
        href: "/groups",
        icon: Users,
        hoverColor: "hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300",
        activeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
      },
      {
        title: "World Search",
        href: "/world/search",
        icon: Search,
        hoverColor: "hover:bg-slate-500/10 hover:text-slate-700 dark:hover:text-slate-300",
        activeColor: "bg-slate-500/15 text-slate-700 dark:text-slate-200",
      },
      {
        title: "Shared Worlds",
        href: "/world/shared",
        icon: Share2,
        hoverColor: "hover:bg-cyan-500/10 hover:text-cyan-700 dark:hover:text-cyan-300",
        activeColor: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-200",
      },
      {
        title: "Export",
        href: "/world/export",
        icon: Download,
        hoverColor: "hover:bg-orange-500/10 hover:text-orange-700 dark:hover:text-orange-300",
        activeColor: "bg-orange-500/15 text-orange-700 dark:text-orange-200",
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Profile",
        href: "/profile",
        icon: User,
        hoverColor: "hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-300",
        activeColor: "bg-sky-500/15 text-sky-700 dark:text-sky-200",
      },
      {
        title: "Badges",
        href: "/profile/badges",
        icon: Trophy,
        hoverColor: "hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300",
        activeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-200",
      },
      {
        title: "Settings",
        href: "/profile/settings",
        icon: Settings,
        hoverColor: "hover:bg-slate-500/10 hover:text-slate-700 dark:hover:text-slate-300",
        activeColor: "bg-slate-500/15 text-slate-700 dark:text-slate-200",
      },
      {
        title: "Help & FAQ",
        href: "/faq",
        icon: HelpCircle,
        hoverColor: "hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300",
        activeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-200",
      },
    ],
  },
];

const adminSections: DashboardNavSection[] = [
  {
    label: "Admin",
    items: [
      {
        title: "Admin Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        hoverColor: "hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-300",
        activeColor: "bg-violet-500/15 text-violet-700 dark:text-violet-200",
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
        hoverColor: "hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-300",
        activeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-200",
      },
      {
        title: "Moderation",
        href: "/admin/moderation",
        icon: Shield,
        hoverColor: "hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300",
        activeColor: "bg-red-500/15 text-red-700 dark:text-red-200",
      },
      {
        title: "Feature Flags",
        href: "/admin/flags",
        icon: Flag,
        hoverColor: "hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300",
        activeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-200",
      },
      {
        title: "Subscriptions",
        href: "/admin/subscriptions",
        icon: Sparkles,
        hoverColor: "hover:bg-fuchsia-500/10 hover:text-fuchsia-700 dark:hover:text-fuchsia-300",
        activeColor: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-200",
      },
      {
        title: "Audit Log",
        href: "/admin/audit",
        icon: Clock,
        hoverColor: "hover:bg-slate-500/10 hover:text-slate-700 dark:hover:text-slate-300",
        activeColor: "bg-slate-500/15 text-slate-700 dark:text-slate-200",
      },
    ],
  },
];

export function getDashboardSections(isAdmin: boolean) {
  const sections = isAdmin ? [...mainSections, ...adminSections] : mainSections;

  for (const section of sections) {
    section.items = section.items.filter((item) => {
      if (item.href === "/groups" && !isEnabledSync("groups_feature")) return false;
      if (item.href === "/stats" && !isEnabledSync("writing_stats")) return false;
      if (item.href === "/world/search" && !isEnabledSync("search")) return false;
      return true;
    });
  }

  return sections.filter((section) => section.items.length > 0);
}
