export type {
  AiModelProvider,
  AiModelId,
  AiMessage,
  AiCompletionRequest,
  AiCompletionResponse,
  AiProviderAdapter,
  AiFeatureConfig,
  AiSettings,
  AiFeatureId,
  OpenRouterConfig,
} from "./types";

export {
  AI_MODEL_CATALOG,
  AI_FEATURE_IDS,
  DEFAULT_AI_SETTINGS,
  DEFAULT_OPENROUTER_CONFIG,
  FREE_MODEL_FEATURE_MAP,
  OPENROUTER_KNOWN_FREE_MODELS,
  estimateCost,
} from "./types";

export { BaseAiAdapter } from "./adapter";
export { OpenRouterAdapter } from "./openrouter";
export {
  getAiAdapter,
  resolveProvider,
  resolveModel,
  shouldUseFreeModel,
  clearAdapterCache,
} from "./factory";
