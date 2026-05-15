import "server-only";

import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if user has admin role in public.users table
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { settings: true },
    });
    
    if (!dbUser?.settings) return false;
    const settings = dbUser.settings as Record<string, unknown>;
    return settings.is_admin === true || settings.is_moderator === true;
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) throw new Error("Forbidden: admin access required");
}
