import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const take = Number(searchParams.get("take")) || 20;
  const skip = Number(searchParams.get("skip")) || 0;
  const following = await prisma.follow.findMany({
    where: { followerId: user.id },
    include: { followee: { select: { id: true, name: true, username: true, image: true } } },
    take,
    skip,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(following);
}
