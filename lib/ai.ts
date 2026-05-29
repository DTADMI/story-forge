/**
 * StoryForge AI Adapter — multi-provider with OpenRouter, DeepSeek, OpenAI, and mock.
 * Handles model selection, streaming, retries, and usage tracking.
 */
import type {
  AiAdapter,
  AiChatCompletionParams,
  AiChatCompletionResponse,
  AiFeature,
  AiProvider,
  AiStreamEvent,
} from "@/lib/ai-types";
import { AI_FEATURE_CONFIGS, AI_MODELS } from "@/lib/ai-types";
import { recordAiRequest } from "@/lib/ai-monitoring";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

function resolveAiProvider(): AiProvider {
  const envProvider = process.env.AI_PROVIDER?.toLowerCase();
  if (envProvider === "deepseek") return "deepseek";
  if (envProvider === "openai") return "openai";
  if (envProvider === "mock") return "mock";
  return "openrouter";
}

function getModelForFeature(feature: AiFeature): string {
  const config = AI_FEATURE_CONFIGS[feature];
  const provider = resolveAiProvider();
  if (provider === "deepseek") return AI_MODELS.deepseek;
  if (provider === "openai") return AI_MODELS.openai;
  return config.model;
}

const MOCK_RESPONSES: Record<string, string> = {
  suggest: JSON.stringify({
    suggestion: "[Mock] Consider varying sentence length to improve rhythm.",
  }),
  character: JSON.stringify({
    name: "[Mock] Aurelia",
    traits: ["brave", "impulsive", "loyal"],
    backstory: "A former soldier with a mysterious past.",
    arc: "Redemption arc — from lone wolf to trusted leader.",
  }),
  plot: JSON.stringify({
    analysis:
      "[Mock] The pacing is strong in Act 1 but slows in Act 2. Consider adding a midpoint reversal.",
    strengths: ["Strong hook", "Clear protagonist goal"],
    recommendations: ["Add subplot for side character", "Increase tension in Act 2"],
  }),
  style: JSON.stringify({
    analysis: "[Mock] The voice is distinctive but shifts between chapters 3 and 4.",
    strengths: ["Vivid imagery", "Strong dialogue"],
    recommendations: ["Maintain consistent POV depth", "Vary sentence openings"],
  }),
  research: JSON.stringify({
    findings: "[Mock] Medieval blacksmiths typically used charcoal forges reaching 1100-1200°C.",
    sources: ["Medieval Technology and Social Change (White, 1962)"],
    reliability: "Speculative — verify with additional sources.",
  }),
};

function createMockAdapter(): AiAdapter {
  return {
    async chatCompletion(params: AiChatCompletionParams): Promise<AiChatCompletionResponse> {
      await new Promise((r) => setTimeout(r, 100));
      const userContent = params.messages.find((m) => m.role === "user")?.content ?? "";
      let feature: AiFeature = "suggest";
      if (userContent.includes("character")) feature = "character";
      else if (userContent.includes("plot")) feature = "plot";
      else if (userContent.includes("style")) feature = "style";
      else if (userContent.includes("research")) feature = "research";

      return {
        content: MOCK_RESPONSES[feature] ?? MOCK_RESPONSES.suggest,
        model: "mock-model",
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      };
    },

    async *chatCompletionStream(params: AiChatCompletionParams): AsyncGenerator<{
      type: "chunk" | "done" | "error";
      content?: string;
      error?: string;
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    }> {
      const result = await this.chatCompletion(params);
      for (const char of result.content) {
        yield { type: "chunk", content: char };
        await new Promise((r) => setTimeout(r, 5));
      }
      yield { type: "done", usage: result.usage };
    },
  };
}

function createOpenRouterAdapter(): AiAdapter {
  const apiKey = process.env.OPENROUTER_API_KEY;

  return {
    async chatCompletion(params: AiChatCompletionParams): Promise<AiChatCompletionResponse> {
      const model = params.model ?? AI_MODELS.default;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://storyforge.app",
              "X-Title": "StoryForge",
            },
            body: JSON.stringify({
              model,
              messages: params.messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              temperature: params.temperature ?? 0.7,
              max_tokens: params.max_tokens ?? 500,
              ...(params.response_format ? { response_format: params.response_format } : {}),
            }),
          });

          if (!res.ok) {
            const errText = await res.text().catch(() => "");
            const status = res.status;
            if (status === 429) {
              if (attempt < MAX_RETRIES) {
                await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
                continue;
              }
              throw new Error("OpenRouter rate limited. Please try again later.");
            }
            if (status >= 500 && attempt < MAX_RETRIES) {
              await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
              continue;
            }
            throw new Error(`OpenRouter API error ${status}: ${errText.slice(0, 200)}`);
          }

          const json = await res.json();
          return {
            content: json.choices?.[0]?.message?.content ?? "",
            model: json.model ?? model,
            usage: json.usage,
          };
        } catch (e) {
          lastError = e instanceof Error ? e : new Error(String(e));
          if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
          }
        }
      }

      throw lastError ?? new Error("OpenRouter request failed after retries");
    },

    async *chatCompletionStream(params: AiChatCompletionParams): AsyncGenerator<AiStreamEvent> {
      const model = params.model ?? AI_MODELS.default;

      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://storyforge.app",
            "X-Title": "StoryForge",
          },
          body: JSON.stringify({
            model,
            messages: params.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            temperature: params.temperature ?? 0.7,
            max_tokens: params.max_tokens ?? 500,
            stream: true,
            ...(params.response_format ? { response_format: params.response_format } : {}),
          }),
        });

        if (!res.ok) {
          yield { type: "error", error: `OpenRouter API error ${res.status}` };
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          yield { type: "error", error: "No response body" };
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              yield { type: "done" };
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                yield { type: "chunk", content: delta };
              }
            } catch {
              // skip malformed chunks
            }
          }
        }

        yield { type: "done" };
      } catch (e) {
        yield { type: "error", error: e instanceof Error ? e.message : "Streaming failed" };
      }
    },
  };
}

function createDeepSeekAdapter(): AiAdapter {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  return {
    async chatCompletion(params: AiChatCompletionParams): Promise<AiChatCompletionResponse> {
      const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: params.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: params.temperature ?? 0.7,
          max_tokens: params.max_tokens ?? 500,
          ...(params.response_format ? { response_format: params.response_format } : {}),
        }),
      });

      if (!res.ok) {
        throw new Error(`DeepSeek API error: ${res.status}`);
      }

      const json = await res.json();
      return {
        content: json.choices?.[0]?.message?.content ?? "",
        model: "deepseek-chat",
        usage: json.usage,
      };
    },
  };
}

function createOpenAiAdapter(): AiAdapter {
  const apiKey = process.env.OPENAI_API_KEY;

  return {
    async chatCompletion(params: AiChatCompletionParams): Promise<AiChatCompletionResponse> {
      const model = params.model ?? AI_MODELS.openai;
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: params.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: params.temperature ?? 0.7,
          max_tokens: params.max_tokens ?? 500,
          ...(params.response_format ? { response_format: params.response_format } : {}),
        }),
      });

      if (!res.ok) {
        throw new Error(`OpenAI API error: ${res.status}`);
      }

      const json = await res.json();
      return {
        content: json.choices?.[0]?.message?.content ?? "",
        model: json.model ?? model,
        usage: json.usage,
      };
    },
  };
}

function wrapWithMonitoring(adapter: AiAdapter): AiAdapter {
  const originalCompletion = adapter.chatCompletion.bind(adapter);
  return {
    ...adapter,
    chatCompletion: async (params) => {
      const start = Date.now();
      try {
        const result = await originalCompletion(params);
        const feature = (params as { _feature?: AiFeature })._feature;
        if (feature) {
          void recordAiRequest({
            feature,
            latencyMs: Date.now() - start,
            success: true,
            provider: resolveAiProvider(),
            model: result.model ?? "unknown",
            tokensInput: result.usage?.prompt_tokens ?? 0,
            tokensOutput: result.usage?.completion_tokens ?? 0,
            timestamp: Date.now(),
          }).catch(() => {});
        }
        return result;
      } catch (error) {
        const feature = (params as { _feature?: AiFeature })._feature;
        if (feature) {
          void recordAiRequest({
            feature,
            latencyMs: Date.now() - start,
            success: false,
            provider: resolveAiProvider(),
            model: "unknown",
            tokensInput: 0,
            tokensOutput: 0,
            timestamp: Date.now(),
          }).catch(() => {});
        }
        throw error;
      }
    },
  };
}

export function getAiAdapter(): AiAdapter {
  const provider = resolveAiProvider();
  let adapter: AiAdapter;
  switch (provider) {
    case "deepseek":
      adapter = createDeepSeekAdapter();
      break;
    case "openai":
      adapter = createOpenAiAdapter();
      break;
    case "mock":
      adapter = createMockAdapter();
      break;
    case "openrouter":
    default:
      adapter = createOpenRouterAdapter();
      break;
  }
  return wrapWithMonitoring(adapter);
}

export function getAiAdapterForFeature(feature: AiFeature): {
  adapter: AiAdapter;
  model: string;
  config: (typeof AI_FEATURE_CONFIGS)[AiFeature];
} {
  return {
    adapter: getAiAdapter(),
    model: getModelForFeature(feature),
    config: AI_FEATURE_CONFIGS[feature],
  };
}

export function resolveProvider(_feature?: AiFeature): string {
  return resolveAiProvider() as string;
}
