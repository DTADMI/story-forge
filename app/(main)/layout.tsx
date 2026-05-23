import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/signin");

  let isAdmin = false;
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    isAdmin = dbUser?.role === "admin";
  } catch {
    // db may not be fully initialized
  }

  return <DashboardShell isAdmin={isAdmin}>{children}</DashboardShell>;
}
