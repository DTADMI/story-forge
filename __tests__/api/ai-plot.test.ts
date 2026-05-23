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
import { POST } from "@/app/api/ai/plot/route";

function mockRequest(body?: unknown) {
  return {
    json: () => Promise.resolve(body ?? {}),
    nextUrl: new URL("http://localhost:3000/api/ai/plot"),
    headers: new Headers(),
  } as unknown as Request;
}

describe("AI Plot API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Unauthorized"));

    const response = await POST(mockRequest({ context: "A story plot" }));
    expect(response.status).toBe(401);
  });

  it("returns 403 when feature flag is disabled", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
    });
    (isEnabled as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const response = await POST(mockRequest({ context: "A story plot" }));
    expect(response.status).toBe(403);
  });

  it("returns 429 when daily limit reached", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
    });
    (isEnabled as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      subscriptionTier: "explorer",
    });
    (trackAiUsage as ReturnType<typeof vi.fn>).mockResolvedValue({
      allowed: false,
      remaining: 0,
      limit: 10,
    });

    const response = await POST(mockRequest({ context: "A story plot" }));
    expect(response.status).toBe(429);
  });

  it("returns plot analysis on success", async () => {
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
      remaining: 98,
      limit: 100,
    });

    const mockAnalysis = {
      analysis: {
        overview: "Strong opening with clear stakes.",
        structure: "Well-structured three-act format.",
        pacing: "Good pacing in Act 1.",
        conflict: "Clear external conflict.",
        characters: "Protagonist has strong motivation.",
        resolution: "Resolution is foreshadowed effectively.",
      },
      strengths: ["Engaging hook", "Clear character goals"],
      weaknesses: ["Sagging middle", "Underdeveloped subplot"],
      recommendations: [{ area: "Pacing", suggestion: "Add a midpoint reversal." }],
      score: 7.5,
    };

    (getAiAdapterForFeature as ReturnType<typeof vi.fn>).mockReturnValue({
      adapter: {
        chatCompletion: vi.fn().mockResolvedValue({
          content: JSON.stringify(mockAnalysis),
          model: "claude-3.5-haiku",
          usage: { prompt_tokens: 200, completion_tokens: 300, total_tokens: 500 },
        }),
      },
      model: "anthropic/claude-3.5-haiku",
      config: {
        model: "test",
        systemPrompt: "",
        temperature: 0.7,
        maxTokens: 1200,
        flagId: "ai_plot_analysis",
      },
    });

    const response = await POST(mockRequest({ context: "A story plot about space exploration" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.score).toBe(7.5);
    expect(data.strengths).toHaveLength(2);
    expect(data.recommendations).toHaveLength(1);
    expect(data.remaining).toBe(98);
  });

  it("returns 400 when context is missing", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
    });
    (isEnabled as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      subscriptionTier: "creator",
    });
    (trackAiUsage as ReturnType<typeof vi.fn>).mockResolvedValue({
      allowed: true,
      remaining: 98,
      limit: 100,
    });

    const response = await POST(mockRequest({}));
    expect(response.status).toBe(400);
  });
});
