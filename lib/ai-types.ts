/**
 * Shared types for the StoryForge AI subsystem.
 */

export type AiFeature = "suggest" | "character" | "plot" | "style" | "research";

export type AiProvider = "openrouter" | "deepseek" | "openai" | "mock";

export interface AiChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiChatCompletionParams {
  messages: AiChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" | "text" };
  model?: string;
}

export interface AiChatCompletionResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AiStreamEvent {
  type: "chunk" | "done" | "error";
  content?: string;
  error?: string;
  usage?: AiChatCompletionResponse["usage"];
}

export interface AiAdapter {
  chatCompletion(params: AiChatCompletionParams): Promise<AiChatCompletionResponse>;

  chatCompletionStream?(params: AiChatCompletionParams): AsyncGenerator<AiStreamEvent>;
}

export interface AiRequestContext {
  userId: string;
  feature: AiFeature;
  projectId?: string;
  characterId?: string;
  contentType?: string;
}

export interface AiUsageRecord {
  date: string;
  count: number;
  remaining: number;
  limit: number;
}

export interface AiFeatureConfig {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  flagId: string;
}

export const AI_MODELS = {
  /** Primary model — fast, cheap, good for suggestions and simple tasks */
  default: "openai/gpt-4o-mini",
  /** High-quality model for complex analysis (plot, style, research) */
  premium: "anthropic/claude-3.5-haiku",
  /** DeepSeek model for cost-conscious inference */
  deepseek: "deepseek/deepseek-chat",
  /** OpenAI direct */
  openai: "openai/gpt-4o-mini",
} as const;

export const AI_FEATURE_CONFIGS: Record<AiFeature, AiFeatureConfig> = {
  suggest: {
    model: AI_MODELS.default,
    systemPrompt:
      "You are a creative writing assistant for StoryForge. Provide helpful writing suggestions that fit the context. Keep suggestions concise (1-3 sentences).",
    temperature: 0.8,
    maxTokens: 500,
    flagId: "ai_writing_suggestions",
  },
  character: {
    model: AI_MODELS.default,
    systemPrompt:
      "You are a character development expert for StoryForge. Based on the context, create detailed character traits, backstory ideas, motivations, flaws, and development arcs. Format your response as structured JSON.",
    temperature: 0.9,
    maxTokens: 1000,
    flagId: "ai_character_development",
  },
  plot: {
    model: AI_MODELS.premium,
    systemPrompt:
      "You are a story structure analyst for StoryForge. Analyze the plot context and provide insights on pacing, conflict, tension, resolution, subplots, and narrative structure. Offer specific, actionable recommendations.",
    temperature: 0.7,
    maxTokens: 1200,
    flagId: "ai_plot_analysis",
  },
  style: {
    model: AI_MODELS.premium,
    systemPrompt:
      "You are a writing style coach for StoryForge. Review the text and provide analysis of voice, tone, readability, sentence variety, word choice, pacing, and stylistic consistency. Offer specific examples and suggestions.",
    temperature: 0.6,
    maxTokens: 1000,
    flagId: "ai_style_consistency",
  },
  research: {
    model: AI_MODELS.premium,
    systemPrompt:
      "You are a research assistant for StoryForge. Help writers with factual accuracy, world-building research, historical context, scientific plausibility, and cultural details. Provide concise, accurate information with sources when possible.",
    temperature: 0.3,
    maxTokens: 800,
    flagId: "ai_research_assistant",
  },
};

export function getAiFeatureFlag(feature: AiFeature): string {
  return AI_FEATURE_CONFIGS[feature].flagId;
}
