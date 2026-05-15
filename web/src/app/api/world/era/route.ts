import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") || undefined;
  const eras = await prisma.era.findMany({
    where: { userId: user.id, projectId },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(eras);
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const body = await request.json();
  const era = await prisma.era.create({
    data: { ...body, userId: user.id },
  });
  return NextResponse.json(era, { status: 201 });
}
