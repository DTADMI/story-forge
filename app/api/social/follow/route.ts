import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-handler";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const { targetUserId } = await request.json();

  if (!targetUserId || targetUserId === user.id) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followeeId: { followerId: user.id, followeeId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({
    data: { followerId: user.id, followeeId: targetUserId },
  });

  return NextResponse.json({ following: true });
});
