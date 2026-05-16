import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") || undefined;
  const locations = await prisma.location.findMany({
    where: { userId: user.id, projectId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(locations);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await request.json();

  const schema = z.object({ name: z.string().min(1).max(200) }).passthrough();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Validation failed", detail: parsed.error.message },
      { status: 400 }
    );
  const { name, ...rest } = parsed.data;

  const location = await prisma.location.create({
    data: { name, ...rest, userId: user.id },
  });
  return NextResponse.json(location, { status: 201 });
});
