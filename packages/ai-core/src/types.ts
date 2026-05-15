export type AiModelProvider = "deepseek" | "openai" | "anthropic" | "openrouter" | "mock";

export type AiModelId = string;

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiCompletionRequest {
  messages: AiMessage[];
  model?: AiModelId;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" } | { type: "text" };
  stop?: string[];
  thinking?: boolean;
  featureId?: string;
  allowFreeFallback?: boolean;
}

export interface AiCompletionResponse {
  content: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cache_hit_tokens?: number;
    cache_miss_tokens?: number;
  };
  finish_reason: string;
}

export interface AiProviderAdapter {
  readonly provider: AiModelProvider;
  readonly defaultModel: AiModelId;
  chatCompletion(request: AiCompletionRequest): Promise<AiCompletionResponse>;
}

export interface AiFeatureConfig {
  enabled: boolean;
  model?: AiModelId;
  allowFreeFallback?: boolean;
}

export interface OpenRouterConfig {
  freeModelPreference: string[];
  costCapDowngradeThreshold: number;
}

export interface AiSettings {
  provider: AiModelProvider;
  model: AiModelId;
  temperature: number;
  maxTokens: number;
  enabled: boolean;
  features: Record<string, AiFeatureConfig>;
  rateLimit: {
    perHour: number;
    perDay: number;
  };
  costLimit: {
    daily: number;
    monthly: number;
  };
  openRouter?: OpenRouterConfig;
}

export const AI_MODEL_CATALOG: Record<
  string,
  {
    provider: AiModelProvider;
    label: string;
    description: string;
    inputCostPer1M: number;
    outputCostPer1M: number;
    contextWindow: number;
    bestFor: string[];
    deprecated?: boolean;
    freeOnOpenRouter?: boolean;
    openRouterId?: string;
  }
> = {
  "deepseek-v4-flash": {
    provider: "deepseek",
    label: "DeepSeek V4 Flash",
    description: "Latest DeepSeek V4 Flash. 1M context. Best value. Free on OpenRouter.",
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    contextWindow: 1000000,
    bestFor: ["content_generation", "dialogue", "translation", "hints", "moderation"],
    freeOnOpenRouter: true,
    openRouterId: "deepseek/deepseek-v4-flash",
  },
  "deepseek-v4-pro": {
    provider: "deepseek",
    label: "DeepSeek V4 Pro",
    description: "DeepSeek V4 Pro. Best reasoning.",
    inputCostPer1M: 0.435,
    outputCostPer1M: 0.87,
    contextWindow: 1000000,
    bestFor: ["complex_tasks", "creative_writing", "analysis"],
    openRouterId: "deepseek/deepseek-v4-pro",
  },
  "gpt-5.4": {
    provider: "openai",
    label: "GPT-5.4",
    description: "OpenAI GPT-5.4. 1M context.",
    inputCostPer1M: 2.5,
    outputCostPer1M: 15.0,
    contextWindow: 1000000,
    bestFor: ["content_generation", "creative_writing", "complex_tasks"],
    openRouterId: "openai/gpt-5.4",
  },
  "gpt-5.4-mini": {
    provider: "openai",
    label: "GPT-5.4 Mini",
    description: "OpenAI GPT-5.4 Mini. Fast, cost-effective.",
    inputCostPer1M: 0.75,
    outputCostPer1M: 4.5,
    contextWindow: 400000,
    bestFor: ["moderation", "classification", "translation"],
    openRouterId: "openai/gpt-5.4-mini",
  },
  "claude-sonnet-4-6": {
    provider: "anthropic",
    label: "Claude Sonnet 4.6",
    description: "Best speed/intelligence balance. 1M context.",
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    contextWindow: 1000000,
    bestFor: ["content_generation", "creative_writing", "analysis", "moderation"],
    openRouterId: "anthropic/claude-sonnet-4.6",
  },
  "claude-haiku-4-5": {
    provider: "anthropic",
    label: "Claude Haiku 4.5",
    description: "Fastest model. 200K context.",
    inputCostPer1M: 1.0,
    outputCostPer1M: 5.0,
    contextWindow: 200000,
    bestFor: ["moderation", "classification", "fast_tasks"],
    openRouterId: "anthropic/claude-haiku-4.5",
  },
  mock: {
    provider: "mock",
    label: "Mock (No Cost)",
    description: "Returns placeholder responses. For development only.",
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    contextWindow: 0,
    bestFor: ["testing", "development"],
  },
};

export const OPENROUTER_KNOWN_FREE_MODELS: Record<
  string,
  { label: string; bestFor: string[]; contextWindow: number }
> = {
  "deepseek/deepseek-v4-flash:free": {
    label: "DeepSeek V4 Flash (Free)",
    bestFor: ["translation", "dialogue", "hints", "moderation"],
    contextWindow: 1000000,
  },
  "meta-llama/llama-3.3-70b-instruct:free": {
    label: "Llama 3.3 70B (Free)",
    bestFor: ["content_generation", "translation"],
    contextWindow: 128000,
  },
  "google/gemma-4-31b-it:free": {
    label: "Gemma 4 31B (Free)",
    bestFor: ["moderation", "classification", "translation"],
    contextWindow: 128000,
  },
  "qwen/qwen3-next-80b-a3b-instruct:free": {
    label: "Qwen3 Next 80B (Free)",
    bestFor: ["content_generation", "translation"],
    contextWindow: 131072,
  },
  "openai/gpt-oss-120b:free": {
    label: "GPT-OSS 120B (Free)",
    bestFor: ["creative_writing", "content_generation"],
    contextWindow: 128000,
  },
  "meta-llama/llama-3.2-3b-instruct:free": {
    label: "Llama 3.2 3B (Free)",
    bestFor: ["classification", "simple_tasks"],
    contextWindow: 131072,
  },
  "nvidia/nemotron-3-nano-30b-a3b:free": {
    label: "Nemotron 3 Nano (Free)",
    bestFor: ["moderation", "classification"],
    contextWindow: 128000,
  },
};

export const AI_FEATURE_IDS = [
  "content_generation",
  "content_moderation",
  "translation",
  "field_suggest",
  "companion_dialogue",
  "hint_generation",
  "creative_writing",
  "analysis",
  "classification",
] as const;

export type AiFeatureId = (typeof AI_FEATURE_IDS)[number];

export const FREE_MODEL_FEATURE_MAP: Record<string, string> = {
  content_moderation: "google/gemma-4-31b-it:free",
  translation: "meta-llama/llama-3.3-70b-instruct:free",
  field_suggest: "meta-llama/llama-3.3-70b-instruct:free",
  companion_dialogue: "deepseek/deepseek-v4-flash:free",
  hint_generation: "deepseek/deepseek-v4-flash:free",
  classification: "meta-llama/llama-3.2-3b-instruct:free",
};

export const DEFAULT_OPENROUTER_CONFIG: OpenRouterConfig = {
  freeModelPreference: [
    "deepseek/deepseek-v4-flash:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-4-31b-it:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "openai/gpt-oss-120b:free",
  ],
  costCapDowngradeThreshold: 80,
};

export const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: "openrouter",
  model: "deepseek/deepseek-v4-flash",
  temperature: 0.7,
  maxTokens: 2000,
  enabled: false,
  features: Object.fromEntries(
    AI_FEATURE_IDS.map((id) => [id, { enabled: false, allowFreeFallback: false }])
  ) as AiSettings["features"],
  rateLimit: {
    perHour: 100,
    perDay: 500,
  },
  costLimit: {
    daily: 5,
    monthly: 50,
  },
  openRouter: DEFAULT_OPENROUTER_CONFIG,
};

export function estimateCost(
  modelId: AiModelId,
  promptTokens: number,
  completionTokens: number
): number {
  if (modelId.includes(":free")) return 0;
  const model = AI_MODEL_CATALOG[modelId];
  if (!model) return 0;

  let cost = 0;
  cost += (promptTokens / 1_000_000) * model.inputCostPer1M;
  cost += (completionTokens / 1_000_000) * model.outputCostPer1M;
  return cost;
}
