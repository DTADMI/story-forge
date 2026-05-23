import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { trackAiUsage } from "@/lib/ai-usage";
import { isEnabled } from "@/lib/flags";
import { validateInput, aiPlotSchema } from "@/lib/validation";
import { getAiAdapterForFeature } from "@/lib/ai";
import { checkRateLimit, RateLimitTiers } from "@/lib/rate-limit";
import { withErrorHandler } from "@/lib/api-handler";

const SYSTEM_PROMPT = `You are a story structure analyst for StoryForge. Analyze the provided story content and return a JSON object with this structure:

{
  "analysis": {
    "overview": "Brief overall assessment (2-3 sentences)",
    "structure": "Analysis of narrative structure (acts, scenes, chapters)",
    "pacing": "Pacing assessment with specific examples",
    "conflict": "Conflict and tension analysis",
    "characters": "Character-driven plot assessment",
    "resolution": "Assessment of resolution quality and setup"
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "recommendations": [
    { "area": "Area name", "suggestion": "Specific, actionable recommendation" }
  ],
  "score": 7.5
}

Score from 1-10. Be honest, constructive, and specific. Provide actionable feedback.`;

export const POST = withErrorHandler(async (request: NextRequest) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
  const { allowed: ipAllowed } = await checkRateLimit(
    `${RateLimitTiers.AI.keyPrefix}:${ip}`,
    RateLimitTiers.AI.maxRequests
  );
  if (!ipAllowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const user = await requireUser();

  if (!(await isEnabled("ai_assist")) && !(await isEnabled("ai_plot_analysis"))) {
    return NextResponse.json({ error: "AI Plot Analysis is not available." }, { status: 403 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, subscriptionTier: true },
  });

  const tier = dbUser?.subscriptionTier ?? "free";
  const usage = await trackAiUsage(user.id, tier, "plot");

  if (!usage.allowed) {
    return NextResponse.json(
      {
        error:
          tier === "free"
            ? "AI features require a subscription. Upgrade your plan to access AI Plot Analysis."
            : `Daily AI request limit reached (${usage.limit}/${usage.limit}). Try again tomorrow.`,
        remaining: 0,
        limit: usage.limit,
      },
      { status: 429 }
    );
  }

  const body = await request.json();
  const validation = validateInput(aiPlotSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request", details: validation.errors.issues },
      { status: 400 }
    );
  }

  const { context, projectId } = validation.data;

  if (projectId) {
    const hasAccess = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    });
    if (!hasAccess) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }

  const { adapter, model, config } = getAiAdapterForFeature("plot");

  const response = await adapter.chatCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: context.slice(0, 15000) },
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    response_format: { type: "json_object" },
    model,
  });

  let result: Record<string, unknown>;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = {
      analysis: { overview: response.content },
      strengths: [],
      weaknesses: [],
      recommendations: [],
      score: 0,
    };
  }

  return NextResponse.json({
    ...result,
    model: response.model,
    usage: response.usage,
    remaining: usage.remaining,
    limit: usage.limit,
  });
});
