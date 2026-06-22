import "server-only";

import { prisma } from "@/lib/prisma";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Ensures a database User record exists for an authenticated Supabase user.
 * Called at the beginning of authenticated requests to handle cases where
 * the DB trigger may not have fired or the record is incomplete.
 */
export async function ensureUser(supabaseUser: SupabaseUser): Promise<{
  id: string;
  email: string | null;
  role: string;
  subscriptionTier: string;
}> {
  const id = supabaseUser.id;
  const email = supabaseUser.email ?? null;
  const emailConfirmed = supabaseUser.email_confirmed_at;
  const name =
    (supabaseUser.user_metadata?.name as string) || supabaseUser.email?.split("@")[0] || null;

  const record = await prisma.user.upsert({
    where: { id },
    create: {
      id,
      email,
      emailVerified: emailConfirmed ? new Date(emailConfirmed) : undefined,
      name,
      role: "reader",
      subscriptionTier: "free",
    },
    update: {
      email,
      emailVerified: emailConfirmed ? new Date(emailConfirmed) : undefined,
      name: name ?? undefined,
    },
  });

  return {
    id: record.id,
    email: record.email,
    role: record.role,
    subscriptionTier: record.subscriptionTier,
  };
}

/**
 * Resolves whether a user has admin privileges.
 * Uses the database role field.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return dbUser?.role === "admin";
  } catch {
    return false;
  }
}
