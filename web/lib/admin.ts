import "server-only";

import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, settings: true },
    });

    if (!dbUser) return false;
    if (dbUser.role === "admin" || dbUser.role === "moderator") return true;

    // Legacy fallback: check settings JSON
    if (dbUser.settings) {
      const settings = dbUser.settings as Record<string, unknown>;
      if (settings.is_admin === true || settings.is_moderator === true) return true;
    }

    return false;
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) throw new Error("Forbidden: admin access required");
}
