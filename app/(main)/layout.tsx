import { ReactNode } from "react";
import { redirect } from "@/i18n/routing";
import { getUser } from "@/lib/supabase/server";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const user = await getUser();
  if (!user) {
    redirect({ href: "/signin", locale: "en" });
  }
  return <>{children}</>;
}
