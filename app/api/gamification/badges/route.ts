import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();
  const badges = await prisma.userBadge.findMany({
    where: { userId: user.id },
    include: { badge: true },
    orderBy: { awardedAt: "desc" },
  });
  return NextResponse.json(badges);
}
