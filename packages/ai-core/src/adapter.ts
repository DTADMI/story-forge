import type { AiCompletionRequest, AiCompletionResponse } from "./types";

export abstract class BaseAiAdapter {
  abstract readonly provider: string;
  abstract readonly defaultModel: string;
  abstract chatCompletion(request: AiCompletionRequest): Promise<AiCompletionResponse>;

  protected buildHeaders(apiKey: string): Record<string, string> {
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  protected async fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 2
  ): Promise<Response> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        if (response.status === 429) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        if (response.status >= 500) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }
        const body = await response.text();
        throw new Error(`AI API error ${response.status}: ${body.slice(0, 200)}`);
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    }
    throw lastError ?? new Error("AI API request failed after retries");
  }

  protected parseResponse(data: Record<string, unknown>): AiCompletionResponse {
    const choices = data.choices as Array<{
      message: { content: string };
      finish_reason: string;
    }>;
    const usage = data.usage as {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };

    return {
      content: choices[0]?.message?.content ?? "",
      model: (data.model as string) ?? "unknown",
      usage: {
        prompt_tokens: usage?.prompt_tokens ?? 0,
        completion_tokens: usage?.completion_tokens ?? 0,
        total_tokens: usage?.total_tokens ?? 0,
      },
      finish_reason: choices[0]?.finish_reason ?? "stop",
    };
  }
}
