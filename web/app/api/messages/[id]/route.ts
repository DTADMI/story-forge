import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, notFound } from "@/lib/error-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const partner = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, username: true, image: true },
  });
  if (!partner) return notFound("User not found");

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: id },
        { senderId: id, receiverId: user.id },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, username: true, image: true } },
      receiver: { select: { id: true, name: true, username: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ partner, messages });
}

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const result = await prisma.message.updateMany({
    where: {
      senderId: id,
      receiverId: user.id,
      read: false,
    },
    data: { read: true },
  });

  return NextResponse.json({ markedRead: result.count });
}
