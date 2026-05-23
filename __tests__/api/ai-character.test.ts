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
  resolveProvider: vi.fn(),
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
import { POST } from "@/app/api/ai/character/route";

function mockRequest(body?: unknown) {
  return {
    json: () => Promise.resolve(body ?? {}),
    nextUrl: new URL("http://localhost:3000/api/ai/character"),
    headers: new Headers(),
  } as unknown as Request;
}

describe("AI Character API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Unauthorized"));

    const response = await POST(mockRequest({ context: "A fantasy novel" }));
    expect(response.status).toBe(401);
  });

  it("returns 403 when feature flag is disabled", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
    });
    (isEnabled as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const response = await POST(mockRequest({ context: "A fantasy novel" }));
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

    const response = await POST(mockRequest({ context: "A fantasy novel" }));
    expect(response.status).toBe(429);
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
      remaining: 99,
      limit: 100,
    });

    const response = await POST(mockRequest({}));
    expect(response.status).toBe(400);
  });

  it("generates character suggestions on success", async () => {
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
      remaining: 99,
      limit: 100,
    });

    const mockSuggestions = {
      suggestions: [
        {
          name: "Kael",
          role: "Protagonist",
          traits: ["brave", "stubborn"],
          flaws: ["impulsive"],
          motivations: ["revenge"],
          backstory: "A former knight seeking justice.",
          arc: "From vengeance to forgiveness.",
          relationships: [],
        },
      ],
    };

    (getAiAdapterForFeature as ReturnType<typeof vi.fn>).mockReturnValue({
      adapter: {
        chatCompletion: vi.fn().mockResolvedValue({
          content: JSON.stringify(mockSuggestions),
          model: "gpt-4o-mini",
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        }),
      },
      model: "openai/gpt-4o-mini",
      config: {
        model: "test",
        systemPrompt: "",
        temperature: 0.7,
        maxTokens: 500,
        flagId: "ai_character_development",
      },
    });

    const response = await POST(mockRequest({ context: "A fantasy novel about knights" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions).toHaveLength(1);
    expect(data.suggestions[0].name).toBe("Kael");
    expect(data.remaining).toBe(99);
    expect(data.limit).toBe(100);
  });
});
