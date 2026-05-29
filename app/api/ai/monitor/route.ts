import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getAiMetrics, clearAiMetrics } from "@/lib/ai-monitoring";

export async function GET() {
  await requireAdmin();
  const metrics = await getAiMetrics();
  return NextResponse.json(metrics);
}

export async function DELETE() {
  await requireAdmin();
  await clearAiMetrics();
  return NextResponse.json({ cleared: true });
}
