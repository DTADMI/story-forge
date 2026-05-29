import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { trackAiUsage } from "@/lib/ai-usage";
import { isEnabled } from "@/lib/flags";
import { validateInput, aiSuggestSchema } from "@/lib/validation";
import { getAiAdapterForFeature } from "@/lib/ai";
import { checkRateLimit, RateLimitTiers } from "@/lib/rate-limit";
import { withErrorHandler } from "@/lib/api-handler";

const SYSTEM_PROMPTS: Record<string, string> = {
  suggest:
    "You are a creative writing assistant for StoryForge. Provide helpful writing suggestions that fit the context. Keep suggestions concise (1-3 sentences).",
  character:
    "You are a character development expert. Based on the context, suggest character traits, backstory ideas, or development arcs.",
  plot: "You are a story structure analyst. Analyze the plot context and suggest improvements for pacing, conflict, or resolution.",
  style:
    "You are a writing style coach. Review the text and suggest improvements for consistency, voice, and readability.",
};

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

  if (!(await isEnabled("ai_assist")) && !(await isEnabled("ai_writing_suggestions"))) {
    return NextResponse.json(
      { error: "AI Writing Suggestions are not available." },
      { status: 403 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, subscriptionTier: true },
  });

  const tier = dbUser?.subscriptionTier ?? "free";
  const usage = await trackAiUsage(user.id, tier, "suggest");

  if (!usage.allowed) {
    return NextResponse.json(
      {
        error:
          tier === "free"
            ? "AI features require a subscription. Upgrade your plan to access AI Writing Suggestions."
            : `Daily AI request limit reached (${usage.limit}/${usage.limit}). Try again tomorrow.`,
        remaining: 0,
        limit: usage.limit,
      },
      { status: 429 }
    );
  }

  const body = await request.json();
  const validation = validateInput(aiSuggestSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request", details: validation.errors.issues },
      { status: 400 }
    );
  }

  const { feature, context, multiple, projectId } = validation.data;

  if (projectId) {
    const hasAccess = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    });
    if (!hasAccess) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }

  const { adapter, model, config } = getAiAdapterForFeature(
    feature === "character" || feature === "plot" || feature === "style" ? feature : "suggest"
  );

  const systemPrompt = SYSTEM_PROMPTS[feature] ?? SYSTEM_PROMPTS.suggest;
  const userPrompt = multiple
    ? `Based on the following context, provide 3 different writing suggestions as a JSON array of strings:\n\n${context.slice(0, 2000)}\n\nReturn: {"suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]}`
    : `Based on the following context, provide ONE writing suggestion as a JSON object:\n\n${context.slice(0, 2000)}\n\nReturn: {"suggestion": "your suggestion here"}`;

  const response = await adapter.chatCompletion({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    response_format: { type: "json_object" },
    model,
    _feature:
      (feature as string) === "character" ||
      (feature as string) === "plot" ||
      (feature as string) === "style" ||
      (feature as string) === "research"
        ? (feature as string as "character" | "plot" | "style" | "research")
        : "suggest",
  });

  let result: Record<string, unknown>;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = { suggestion: response.content };
  }

  return NextResponse.json({
    suggestion: result.suggestion,
    suggestions: result.suggestions,
    model: response.model,
    usage: response.usage,
    remaining: usage.remaining,
    limit: usage.limit,
  });
});
