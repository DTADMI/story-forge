import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/lib/flags", () => ({
  isEnabled: vi.fn(),
}));

vi.mock("@/lib/ai-usage", () => ({
  trackAiUsage: vi.fn(),
}));

vi.mock("@/lib/ai", () => ({
  getAiAdapterForFeature: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  RateLimitTiers: { AI: { maxRequests: 30, keyPrefix: "rate:ai" } },
}));

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/server";
import { isEnabled } from "@/lib/flags";
import { trackAiUsage } from "@/lib/ai-usage";
import { getAiAdapterForFeature } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";
import { POST } from "@/app/api/ai/style/route";

function mockRequest(body?: unknown) {
  return {
    json: () => Promise.resolve(body ?? {}),
    nextUrl: new URL("http://localhost:3000/api/ai/style"),
    headers: new Headers(),
  } as unknown as Request;
}

describe("AI Style API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Unauthorized"));

    const response = await POST(mockRequest({ context: "A text passage" }));
    expect(response.status).toBe(401);
  });

  it("returns 403 when feature flag is disabled", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
    });
    (isEnabled as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const response = await POST(mockRequest({ context: "A text passage" }));
    expect(response.status).toBe(403);
  });

  it("returns style analysis on success", async () => {
    const mockUser = { id: "user-1", email: "test@test.com" };

    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
    (isEnabled as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (checkRateLimit as ReturnType<typeof vi.fn>).mockResolvedValue({ allowed: true });
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      subscriptionTier: "creator",
    });
    (trackAiUsage as ReturnType<typeof vi.fn>).mockResolvedValue({
      allowed: true,
      remaining: 97,
      limit: 100,
    });

    const mockAnalysis = {
      analysis: {
        voice: "Distinctive first-person narrative voice.",
        tone: "Consistently dark and introspective.",
        readability: "Generally smooth with some dense passages.",
        sentenceVariety: "Good mix of short and long sentences.",
        wordChoice: "Rich vocabulary appropriate to the genre.",
        consistency: "Consistent throughout the sample.",
      },
      strengths: ["Strong voice", "Vivid imagery"],
      improvements: ["Vary sentence openings"],
      suggestions: [
        {
          text: "He walked slowly to the door.",
          issue: "Adverb can be replaced with stronger verb",
          rewrite: "He crept to the door.",
        },
      ],
      styleProfile: {
        formality: "balanced",
        density: "moderate",
        emotion: "emotional",
      },
    };

    (getAiAdapterForFeature as ReturnType<typeof vi.fn>).mockReturnValue({
      adapter: {
        chatCompletion: vi.fn().mockResolvedValue({
          content: JSON.stringify(mockAnalysis),
          model: "claude-3.5-haiku",
          usage: { prompt_tokens: 150, completion_tokens: 250, total_tokens: 400 },
        }),
      },
      model: "anthropic/claude-3.5-haiku",
      config: {
        model: "test",
        systemPrompt: "",
        temperature: 0.6,
        maxTokens: 1000,
        flagId: "ai_style_consistency",
      },
    });

    const response = await POST(
      mockRequest({ context: "A dark fantasy passage.", styleGuide: "Use active voice" })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.strengths).toHaveLength(2);
    expect(data.suggestions).toHaveLength(1);
    expect(data.styleProfile.formality).toBe("balanced");
    expect(data.remaining).toBe(97);
  });
});
