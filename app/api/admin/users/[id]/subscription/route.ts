import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-handler";

export const PATCH = withErrorHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const { id: userId } = await params;
    const body: { subscriptionTier?: string; subscriptionStatus?: string } = await request.json();

    const data: Record<string, unknown> = {};
    if (body.subscriptionTier !== undefined) data.subscriptionTier = body.subscriptionTier;
    if (body.subscriptionStatus !== undefined) data.subscriptionStatus = body.subscriptionStatus;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const validTiers = ["free", "explorer", "creator", "lifetime"];
    if (body.subscriptionTier && !validTiers.includes(body.subscriptionTier)) {
      return NextResponse.json({ error: "Invalid subscription tier" }, { status: 400 });
    }
    const validStatuses = ["active", "canceled", "past_due", "trialing"];
    if (body.subscriptionStatus && !validStatuses.includes(body.subscriptionStatus)) {
      return NextResponse.json({ error: "Invalid subscription status" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  }
);
