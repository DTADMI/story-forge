import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isEnabled } from "@/lib/flags-server";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  isPrivate: z.boolean().optional(),
});

export async function GET() {
  if (!(await isEnabled("groups_feature"))) {
    return NextResponse.json({ error: "Feature disabled" }, { status: 404 });
  }
  const user = await requireUser();
  const groups = await prisma.group.findMany({
    where: { OR: [{ isPrivate: false }, { members: { some: { userId: user.id } } }] },
    include: {
      members: { include: { user: { select: { id: true, name: true, username: true } } } },
    },
  });
  return NextResponse.json(groups);
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const body = await request.json();

  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", detail: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 }
    );
  }

  const group = await prisma.group.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      isPrivate: parsed.data.isPrivate ?? false,
      members: { create: { userId: user.id, role: "admin" } },
    },
    include: { members: true },
  });
  return NextResponse.json(group, { status: 201 });
}
