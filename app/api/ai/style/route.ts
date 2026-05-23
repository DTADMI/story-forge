import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { trackAiUsage } from "@/lib/ai-usage";
import { isEnabled } from "@/lib/flags";
import { validateInput, aiStyleSchema } from "@/lib/validation";
import { getAiAdapterForFeature } from "@/lib/ai";
import { checkRateLimit, RateLimitTiers } from "@/lib/rate-limit";
import { withErrorHandler } from "@/lib/api-handler";

const SYSTEM_PROMPT = `You are a writing style coach for StoryForge. Analyze the provided text and return a JSON object with this structure:

{
  "analysis": {
    "voice": "Assessment of narrative voice (1-2 sentences)",
    "tone": "Tone description and consistency check",
    "readability": "Readability assessment with specific observations",
    "sentenceVariety": "Analysis of sentence length, structure, and variety",
    "wordChoice": "Diction and vocabulary assessment",
    "consistency": "Style consistency check across the text"
  },
  "strengths": ["stylistic strength 1", "stylistic strength 2", "stylistic strength 3"],
  "improvements": ["area to improve 1", "area to improve 2"],
  "suggestions": [
    { "text": "Original passage (brief)", "issue": "Style issue identified", "rewrite": "Improved version" }
  ],
  "styleProfile": {
    "formality": "formal / balanced / casual",
    "density": "dense / moderate / sparse",
    "emotion": "detached / measured / emotional / intense"
  }
}

Be specific and constructive. If a style guide is provided, use it as the reference for improvement suggestions.`;

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

  if (!(await isEnabled("ai_assist")) && !(await isEnabled("ai_style_consistency"))) {
    return NextResponse.json({ error: "AI Style Consistency is not available." }, { status: 403 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, subscriptionTier: true },
  });

  const tier = dbUser?.subscriptionTier ?? "free";
  const usage = await trackAiUsage(user.id, tier, "style");

  if (!usage.allowed) {
    return NextResponse.json(
      {
        error:
          tier === "free"
            ? "AI features require a subscription. Upgrade your plan to access AI Style Analysis."
            : `Daily AI request limit reached (${usage.limit}/${usage.limit}). Try again tomorrow.`,
        remaining: 0,
        limit: usage.limit,
      },
      { status: 429 }
    );
  }

  const body = await request.json();
  const validation = validateInput(aiStyleSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request", details: validation.errors.issues },
      { status: 400 }
    );
  }

  const { context, projectId, styleGuide } = validation.data;

  if (projectId) {
    const hasAccess = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    });
    if (!hasAccess) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }

  const { adapter, model, config } = getAiAdapterForFeature("style");

  const userMessage = styleGuide
    ? `Style Guide:\n${styleGuide}\n\nText to analyze:\n${context.slice(0, 10000)}`
    : `Text to analyze:\n${context.slice(0, 10000)}`;

  const response = await adapter.chatCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
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
      improvements: [],
      suggestions: [],
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
