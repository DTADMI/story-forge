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
import { POST } from "@/app/api/ai/research/route";

function mockRequest(body?: unknown) {
  return {
    json: () => Promise.resolve(body ?? {}),
    nextUrl: new URL("http://localhost:3000/api/ai/research"),
    headers: new Headers(),
  } as unknown as Request;
}

describe("AI Research API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Unauthorized"));

    const response = await POST(mockRequest({ query: "medieval blacksmithing" }));
    expect(response.status).toBe(401);
  });

  it("returns 403 when feature flag is disabled", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
    });
    (isEnabled as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const response = await POST(mockRequest({ query: "medieval blacksmithing" }));
    expect(response.status).toBe(403);
  });

  it("returns 429 when daily limit reached on free tier", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
    });
    (isEnabled as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      subscriptionTier: "free",
    });
    (trackAiUsage as ReturnType<typeof vi.fn>).mockResolvedValue({
      allowed: false,
      remaining: 0,
      limit: 0,
    });

    const response = await POST(mockRequest({ query: "medieval blacksmithing" }));
    expect(response.status).toBe(429);
  });

  it("returns research findings on success", async () => {
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
      remaining: 96,
      limit: 100,
    });

    const mockFindings = {
      findings: [
        {
          topic: "Medieval Blacksmithing",
          summary: "Blacksmiths in the Middle Ages used charcoal forges reaching 1100-1200°C.",
          details:
            "A typical village smithy contained a forge, anvil, bellows, and various hammers and tongs.",
          reliability: "high",
          sources: ["Medieval Technology and Social Change (White, 1962)"],
        },
      ],
      accuracyNotes: "Temperatures are approximate and vary by region and era.",
      writingTips: ["Describe the heat shimmer in the air above the forge."],
      furtherReading: ["Pattern welding techniques", "Medieval guild systems"],
    };

    (getAiAdapterForFeature as ReturnType<typeof vi.fn>).mockReturnValue({
      adapter: {
        chatCompletion: vi.fn().mockResolvedValue({
          content: JSON.stringify(mockFindings),
          model: "claude-3.5-haiku",
          usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
        }),
      },
      model: "anthropic/claude-3.5-haiku",
      config: {
        model: "test",
        systemPrompt: "",
        temperature: 0.3,
        maxTokens: 800,
        flagId: "ai_research_assistant",
      },
    });

    const response = await POST(
      mockRequest({ query: "medieval blacksmithing", context: "A story set in 1300s England" })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.findings).toHaveLength(1);
    expect(data.findings[0].topic).toBe("Medieval Blacksmithing");
    expect(data.findings[0].reliability).toBe("high");
    expect(data.writingTips).toHaveLength(1);
    expect(data.remaining).toBe(96);
  });

  it("returns 400 when query is missing", async () => {
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
      remaining: 96,
      limit: 100,
    });

    const response = await POST(mockRequest({}));
    expect(response.status).toBe(400);
  });
});
