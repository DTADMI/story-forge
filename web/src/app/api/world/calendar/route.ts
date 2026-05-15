import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") || undefined;
  const calendars = await prisma.calendar.findMany({
    where: { userId: user.id, projectId },
    include: { months: { orderBy: { orderIndex: "asc" } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(calendars);
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const body = await request.json();
  const { months, ...rest } = body;

  const calendar = await prisma.calendar.create({
    data: {
      ...rest,
      userId: user.id,
      months: months
        ? {
            create: months.map((m: Record<string, unknown>, i: number) => ({
              name: m.name as string,
              days: (m.days as number) ?? 30,
              orderIndex: (m.orderIndex as number) ?? i,
              description: (m.description as string) ?? null,
            })),
          }
        : undefined,
    },
    include: { months: { orderBy: { orderIndex: "asc" } } },
  });

  return NextResponse.json(calendar, { status: 201 });
}
