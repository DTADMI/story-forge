import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const admin = await isAdmin(user.id);

  return <DashboardShell isAdmin={admin}>{children}</DashboardShell>;
}
