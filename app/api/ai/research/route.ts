import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { trackAiUsage } from "@/lib/ai-usage";
import { isEnabled } from "@/lib/flags";
import { validateInput, aiResearchSchema } from "@/lib/validation";
import { getAiAdapterForFeature } from "@/lib/ai";
import { checkRateLimit, RateLimitTiers } from "@/lib/rate-limit";
import { withErrorHandler } from "@/lib/api-handler";

const SYSTEM_PROMPT = `You are a research assistant for StoryForge. Help writers with factual accuracy, world-building research, and cultural details. Return a JSON object with this structure:

{
  "findings": [
    {
      "topic": "Topic name",
      "summary": "Concise, factual summary of the research finding",
      "details": "Additional relevant context or elaboration",
      "reliability": "high / medium / low / speculative",
      "sources": ["Source reference 1", "Source reference 2"]
    }
  ],
  "accuracyNotes": "Brief note about historical/factual accuracy considerations",
  "writingTips": ["How to incorporate this into your story (tip 1)", "How to incorporate this into your story (tip 2)"],
  "furtherReading": ["Suggested subtopic 1", "Suggested subtopic 2"]
}

Be accurate, concise, and helpful. Use general knowledge for common topics. Note when information should be verified against primary sources.`;

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

  if (!(await isEnabled("ai_assist")) && !(await isEnabled("ai_research_assistant"))) {
    return NextResponse.json({ error: "AI Research Assistant is not available." }, { status: 403 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, subscriptionTier: true },
  });

  const tier = dbUser?.subscriptionTier ?? "free";
  const usage = await trackAiUsage(user.id, tier, "research");

  if (!usage.allowed) {
    return NextResponse.json(
      {
        error:
          tier === "free"
            ? "AI features require a subscription. Upgrade your plan to access AI Research Assistant."
            : `Daily AI request limit reached (${usage.limit}/${usage.limit}). Try again tomorrow.`,
        remaining: 0,
        limit: usage.limit,
      },
      { status: 429 }
    );
  }

  const body = await request.json();
  const validation = validateInput(aiResearchSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request", details: validation.errors.issues },
      { status: 400 }
    );
  }

  const { query, context, projectId } = validation.data;

  if (projectId) {
    const hasAccess = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    });
    if (!hasAccess) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }

  const { adapter, model, config } = getAiAdapterForFeature("research");

  const userMessage = context
    ? `Research query: ${query}\n\nStory context for relevance:\n${context.slice(0, 5000)}`
    : `Research query: ${query}`;

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
      findings: [{ topic: query, summary: response.content, reliability: "medium", sources: [] }],
      accuracyNotes: "",
      writingTips: [],
      furtherReading: [],
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
