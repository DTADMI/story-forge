import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const user = await getUser();
  if (!user) {
    redirect("/signin");
  }
  return <>{children}</>;
}
