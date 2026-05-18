import { NextRequest, NextResponse } from "next/server";
import { getAiAdapter, resolveProvider } from "@/lib/ai";

interface SuggestRequest {
  feature: "suggest" | "character" | "plot" | "style";
  context: string;
  multiple?: boolean;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  suggest:
    "You are a creative writing assistant for StoryForge. Provide helpful writing suggestions that fit the context. Keep suggestions concise (1-3 sentences).",
  character:
    "You are a character development expert. Based on the context, suggest character traits, backstory ideas, or development arcs.",
  plot: "You are a story structure analyst. Analyze the plot context and suggest improvements for pacing, conflict, or resolution.",
  style:
    "You are a writing style coach. Review the text and suggest improvements for consistency, voice, and readability.",
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SuggestRequest;
    const { feature, context, multiple } = body;

    if (!context || context.trim().length === 0) {
      return NextResponse.json({ error: "Context is required" }, { status: 400 });
    }

    const adapter = getAiAdapter();
    const systemPrompt = SYSTEM_PROMPTS[feature] ?? SYSTEM_PROMPTS.suggest;
    const userPrompt = multiple
      ? `Based on the following context, provide 3 different writing suggestions as a JSON array of strings:\n\n${context.slice(0, 2000)}\n\nReturn: {"suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]}`
      : `Based on the following context, provide ONE writing suggestion as a JSON object:\n\n${context.slice(0, 2000)}\n\nReturn: {"suggestion": "your suggestion here"}`;

    const response = await adapter.chatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: "json_object" },
      featureId: feature,
      allowFreeFallback: true,
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
    });
  } catch (e) {
    console.error("AI suggest error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI request failed" },
      { status: 500 }
    );
  }
}
