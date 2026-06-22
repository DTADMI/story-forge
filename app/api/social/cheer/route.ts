import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-handler";
import { checkRateLimit, RateLimitTiers } from "@/lib/rate-limit";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
  const { allowed } = await checkRateLimit(
    `${RateLimitTiers.WRITE.keyPrefix}:${ip}`,
    RateLimitTiers.WRITE.maxRequests
  );
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const user = await requireUser();
  const { receiverId, type = "cheer" } = await request.json();

  if (!receiverId || receiverId === user.id) {
    return NextResponse.json({ error: "Cannot cheer yourself" }, { status: 400 });
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.notification.create({
    data: {
      userId: receiverId,
      type,
      title: `${(user.user_metadata?.name as string) || user.email?.split("@")[0] || "Someone"} sent you a cheer!`,
      body: "Keep up the great writing!",
    },
  });

  return NextResponse.json({ cheered: true });
});
