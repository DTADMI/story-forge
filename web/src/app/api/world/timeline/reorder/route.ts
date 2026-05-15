import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const { eventIds } = await request.json();

  if (!Array.isArray(eventIds)) {
    return NextResponse.json({ error: "eventIds must be an array" }, { status: 400 });
  }

  await prisma.$transaction(
    eventIds.map((id: string, index: number) =>
      prisma.timelineEvent.updateMany({
        where: { id, userId: user.id },
        data: { sortOrder: index },
      })
    )
  );

  return NextResponse.json({ success: true });
}
