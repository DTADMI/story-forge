import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") || undefined;
  const events = await prisma.timelineEvent.findMany({
    where: { userId: user.id, projectId },
    orderBy: { date: "asc" },
    include: { characters: true, locations: true },
  });
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const { characterIds, locationIds, ...rest } = await request.json();
  const event = await prisma.timelineEvent.create({
    data: {
      ...rest,
      userId: user.id,
      characters: characterIds ? { connect: characterIds.map((id: string) => ({ id })) } : undefined,
      locations: locationIds ? { connect: locationIds.map((id: string) => ({ id })) } : undefined,
    },
    include: { characters: true, locations: true },
  });
  return NextResponse.json(event, { status: 201 });
}
