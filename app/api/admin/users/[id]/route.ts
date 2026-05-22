import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminId = user?.id || "unknown";

  const { id } = await params;
  const { role, subscriptionTier, subscriptionStatus } = (await request.json()) as {
    role?: string;
    subscriptionTier?: string;
    subscriptionStatus?: string;
  };

  const validRoles = ["reader", "writer", "moderator", "admin"];
  const validTiers = ["free", "explorer", "creator", "lifetime"];
  const validStatuses = ["active", "canceled", "past_due", "unpaid"];

  const data: Record<string, string> = {};

  if (role !== undefined) {
    if (!validRoles.includes(role))
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    data.role = role;
  }

  if (subscriptionTier !== undefined) {
    if (!validTiers.includes(subscriptionTier))
      return NextResponse.json({ error: "Invalid subscription tier" }, { status: 400 });
    data.subscriptionTier = subscriptionTier;
  }

  if (subscriptionStatus !== undefined) {
    if (!validStatuses.includes(subscriptionStatus))
      return NextResponse.json({ error: "Invalid subscription status" }, { status: 400 });
    data.subscriptionStatus = subscriptionStatus;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, role: true, subscriptionTier: true, subscriptionStatus: true },
  });

  await auditLog({
    userId: adminId,
    action: "admin.user_update",
    entityId: id,
    entityType: "user",
    metadata: { updatedFields: Object.keys(data), newValues: data },
  });

  return NextResponse.json(updatedUser);
}
