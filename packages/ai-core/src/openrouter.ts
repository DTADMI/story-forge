import { BaseAiAdapter } from "./adapter";
import type { AiCompletionRequest, AiCompletionResponse, AiModelId } from "./types";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

function toOpenRouterModel(model: string, variant?: "free" | "nitro" | "floor"): string {
  if (model.startsWith("openrouter/")) return model;
  if (model.includes("/")) {
    if (variant && !model.endsWith(`:${variant}`)) return `${model}:${variant}`;
    return model;
  }
  const providerMap: Record<string, string> = {
    "deepseek-v4-flash": "deepseek/deepseek-v4-flash",
    "deepseek-v4-pro": "deepseek/deepseek-v4-pro",
    "gpt-5.4": "openai/gpt-5.4",
    "gpt-5.4-mini": "openai/gpt-5.4-mini",
    "gpt-5.5": "openai/gpt-5.5",
    "claude-opus-4-7": "anthropic/claude-opus-4.7",
    "claude-sonnet-4-6": "anthropic/claude-sonnet-4.6",
    "claude-haiku-4-5": "anthropic/claude-haiku-4.5",
  };
  const mapped = providerMap[model] ?? `deepseek/${model}`;
  if (variant) return `${mapped}:${variant}`;
  return mapped;
}

function getFreeModelForFeature(featureId?: string): string {
  switch (featureId) {
    case "content_moderation":
      return "google/gemma-4-31b-it:free";
    case "translation":
    case "field_suggest":
      return "meta-llama/llama-3.3-70b-instruct:free";
    case "companion_dialogue":
    case "hint_generation":
      return "deepseek/deepseek-v4-flash:free";
    case "classification":
      return "meta-llama/llama-3.2-3b-instruct:free";
    default:
      return "deepseek/deepseek-v4-flash:free";
  }
}

export class OpenRouterAdapter extends BaseAiAdapter {
  readonly provider = "openrouter" as const;
  readonly defaultModel: AiModelId = "deepseek/deepseek-v4-flash";
  private apiKey: string;
  private siteUrl: string;
  private siteName: string;

  constructor(apiKey?: string, siteUrl?: string, siteName?: string) {
    super();
    this.apiKey = apiKey ?? process.env.OPENROUTER_API_KEY ?? "";
    this.siteUrl = siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://storyforge.app";
    this.siteName = siteName ?? "StoryForge";
    if (!this.apiKey) {
      console.warn("OpenRouter API key not configured. Set OPENROUTER_API_KEY.");
    }
  }

  isFreeModel(model: string): boolean {
    return model.endsWith(":free");
  }

  async chatCompletion(
    request: AiCompletionRequest,
    options?: { allowFreeFallback?: boolean; featureId?: string }
  ): Promise<AiCompletionResponse> {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is not configured. Set OPENROUTER_API_KEY.");
    }

    let model = request.model ?? this.defaultModel;
    const allowFree = options?.allowFreeFallback ?? request.allowFreeFallback ?? false;

    const makeRequest = async (modelId: string): Promise<AiCompletionResponse> => {
      const orModel = toOpenRouterModel(modelId);
      const body: Record<string, unknown> = {
        model: orModel,
        messages: request.messages,
        max_tokens: request.max_tokens ?? 1000,
      };

      if (request.temperature !== undefined) {
        body.temperature = request.temperature;
      }

      if (request.response_format) {
        body.response_format = request.response_format;
      }

      if (request.stop) {
        body.stop = request.stop;
      }

      const response = await this.fetchWithRetry(
        `${OPENROUTER_BASE_URL}/chat/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": this.siteUrl,
            "X-OpenRouter-Title": this.siteName,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      return this.parseResponse(data);
    };

    try {
      return await makeRequest(model);
    } catch (firstError) {
      if (!allowFree || this.isFreeModel(model)) {
        throw firstError;
      }

      console.warn(
        `OpenRouter paid model "${model}" failed, falling back to free model for feature: ${options?.featureId ?? "unknown"}`,
        firstError
      );

      const freeModel = getFreeModelForFeature(options?.featureId);
      return makeRequest(freeModel);
    }
  }
}
