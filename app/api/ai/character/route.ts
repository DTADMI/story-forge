import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { trackAiUsage } from "@/lib/ai-usage";
import { isEnabled } from "@/lib/flags";
import { validateInput, aiCharacterSchema } from "@/lib/validation";
import { getAiAdapterForFeature } from "@/lib/ai";
import { checkRateLimit, RateLimitTiers } from "@/lib/rate-limit";
import { withErrorHandler } from "@/lib/api-handler";

const SYSTEM_PROMPT = `You are a character development expert for StoryForge. Based on the provided context, create detailed character profiles. Return a JSON object with these fields:

{
  "suggestions": [
    {
      "name": "Character name",
      "role": "Protagonist / Antagonist / Side character / etc.",
      "traits": ["trait1", "trait2", "trait3"],
      "flaws": ["flaw1", "flaw2"],
      "motivations": ["motivation1", "motivation2"],
      "backstory": "2-3 sentence origin story",
      "arc": "Recommended character development arc",
      "relationships": ["Possible relationship with another character"]
    }
  ]
}

Provide 1-3 character suggestions. Be creative, specific, and avoid generic tropes.`;

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

  if (!(await isEnabled("ai_assist")) && !(await isEnabled("ai_character_development"))) {
    return NextResponse.json(
      { error: "AI Character Development is not available." },
      { status: 403 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, subscriptionTier: true },
  });

  const tier = dbUser?.subscriptionTier ?? "free";
  const usage = await trackAiUsage(user.id, tier, "character");

  if (!usage.allowed) {
    return NextResponse.json(
      {
        error:
          tier === "free"
            ? "AI features require a subscription. Upgrade your plan to access AI Character Development."
            : `Daily AI request limit reached (${usage.limit}/${usage.limit}). Try again tomorrow.`,
        remaining: 0,
        limit: usage.limit,
      },
      { status: 429 }
    );
  }

  const body = await request.json();
  const validation = validateInput(aiCharacterSchema, body);
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

  const { adapter, model, config } = getAiAdapterForFeature("character");

  const response = await adapter.chatCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: context.slice(0, 10000) },
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
      suggestions: [{ name: "Generated Character", traits: [], backstory: response.content }],
    };
  }

  return NextResponse.json({
    suggestions: result.suggestions ?? [],
    model: response.model,
    usage: response.usage,
    remaining: usage.remaining,
    limit: usage.limit,
  });
});
