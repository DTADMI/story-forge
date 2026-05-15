import { OpenRouterAdapter } from "./openrouter";
import type {
  AiProviderAdapter,
  AiModelProvider,
  AiModelId,
  AiSettings,
  AiFeatureId,
} from "./types";
import { DEFAULT_AI_SETTINGS } from "./types";

let cachedAdapter: AiProviderAdapter | null = null;
let cachedProvider: AiModelProvider | null = null;

export function getAiAdapter(settings?: AiSettings): AiProviderAdapter {
  const provider = settings?.provider ?? resolveProvider();

  if (cachedAdapter && cachedProvider === provider) {
    return cachedAdapter;
  }

  cachedProvider = provider;

  switch (provider) {
    case "openrouter":
      cachedAdapter = new OpenRouterAdapter() as unknown as AiProviderAdapter;
      break;
    case "mock":
    default:
      cachedAdapter = {
        provider: "mock",
        defaultModel: "mock",
        async chatCompletion() {
          return {
            content: JSON.stringify({ message: "Mock AI response" }),
            model: "mock",
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
            finish_reason: "stop",
          };
        },
      };
      break;
  }

  return cachedAdapter;
}

export function resolveProvider(): AiModelProvider {
  if (process.env.AI_PROVIDER === "openrouter") return "openrouter";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.NODE_ENV === "development") return "mock";
  return "openrouter";
}

export function resolveModel(
  featureId: string,
  settings?: AiSettings
): { model: AiModelId; allowFreeFallback: boolean } {
  const featureSettings = settings?.features?.[featureId];
  const model = featureSettings?.model ?? settings?.model ?? DEFAULT_AI_SETTINGS.model;
  const allowFreeFallback = featureSettings?.allowFreeFallback ?? false;

  return { model, allowFreeFallback };
}

export function shouldUseFreeModel(
  featureId: string,
  settings?: AiSettings,
  currentDailyCost?: number
): boolean {
  if (settings?.provider !== "openrouter") return false;

  const featureSettings = settings?.features?.[featureId];
  if (!featureSettings?.enabled) return false;
  if (featureSettings?.allowFreeFallback === false) return false;

  const threshold = settings?.openRouter?.costCapDowngradeThreshold ?? 80;
  const dailyLimit = settings?.costLimit?.daily ?? 5;

  if (currentDailyCost !== undefined && dailyLimit > 0) {
    const percentageUsed = (currentDailyCost / dailyLimit) * 100;
    if (percentageUsed >= threshold) return true;
  }

  return false;
}

export function clearAdapterCache(): void {
  cachedAdapter = null;
  cachedProvider = null;
}
