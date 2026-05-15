import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabaseUser = await getUser();
  if (!supabaseUser) redirect("/signin");

  const dbUser = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "admin") redirect("/signin");

  return <>{children}</>;
}
