import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") || undefined;
  const species = await prisma.species.findMany({
    where: { userId: user.id, projectId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(species);
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const body = await request.json();
  const species = await prisma.species.create({
    data: { ...body, userId: user.id },
  });
  return NextResponse.json(species, { status: 201 });
}
