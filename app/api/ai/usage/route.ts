import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getAiUsage, getAiUsageByFeature } from "@/lib/ai-usage";
import { withErrorHandler } from "@/lib/api-handler";

export const GET = withErrorHandler(async () => {
  const user = await requireUser();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, subscriptionTier: true },
  });

  const tier = dbUser?.subscriptionTier ?? "free";
  const dailyUsage = await getAiUsage(user.id, tier);
  const byFeature = await getAiUsageByFeature(user.id);

  return NextResponse.json({
    daily: dailyUsage,
    byFeature,
    tier,
  });
});
