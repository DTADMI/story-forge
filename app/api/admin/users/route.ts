import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  await requireAdmin();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      createdAt: true,
      _count: { select: { projects: true, characters: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(users);
}
