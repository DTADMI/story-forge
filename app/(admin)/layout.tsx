import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const admin = await isAdmin(user.id);
  if (!admin) redirect("/signin");

  return <DashboardShell isAdmin={true}>{children}</DashboardShell>;
}
