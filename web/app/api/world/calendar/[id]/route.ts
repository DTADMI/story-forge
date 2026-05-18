import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const calendar = await prisma.calendar.findFirst({
    where: { id, userId: user.id },
    include: { months: { orderBy: { orderIndex: "asc" } } },
  });
  if (!calendar) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(calendar);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const body = await request.json();
  const { months, ...rest } = body;

  if (months !== undefined) {
    await prisma.calendarMonth.deleteMany({ where: { calendarId: id } });
    if (months.length > 0) {
      await prisma.calendarMonth.createMany({
        data: months.map((m: Record<string, unknown>, i: number) => ({
          calendarId: id,
          name: m.name as string,
          days: (m.days as number) ?? 30,
          orderIndex: (m.orderIndex as number) ?? i,
          description: (m.description as string) ?? null,
        })),
      });
    }
  }

  const calendar = await prisma.calendar.update({
    where: { id, userId: user.id },
    data: rest,
    include: { months: { orderBy: { orderIndex: "asc" } } },
  });

  return NextResponse.json(calendar);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await prisma.calendar.delete({ where: { id, userId: user.id } });
  return NextResponse.json({ deleted: true });
}
