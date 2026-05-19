interface ChatCompletionParams {
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: string };
  featureId?: string;
  allowFreeFallback?: boolean;
}

interface ChatCompletionResponse {
  content: string;
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

interface AiAdapter {
  chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse>;
}

function getOpenRouterAdapter(): AiAdapter {
  return {
    async chatCompletion(params) {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: params.messages,
          temperature: params.temperature ?? 0.7,
          max_tokens: params.max_tokens ?? 500,
          ...(params.response_format ? { response_format: params.response_format } : {}),
        }),
      });

      if (!res.ok) throw new Error(`OpenRouter API error: ${res.status}`);

      const json = await res.json();
      return {
        content: json.choices?.[0]?.message?.content ?? "",
        model: json.model ?? "unknown",
        usage: json.usage,
      };
    },
  };
}

export function getAiAdapter(): AiAdapter {
  return getOpenRouterAdapter();
}

export function resolveProvider(_feature: string): string {
  return "openrouter";
}
