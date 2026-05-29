import { describe, it, expect, vi, beforeEach } from "vitest";

/* eslint-disable @typescript-eslint/no-explicit-any */

const mockUser = { id: "test-user-id" };

vi.mock("@/lib/supabase/server", () => ({
  requireUser: vi.fn(async () => mockUser),
  getUser: vi.fn(async () => mockUser),
  createServerClient: vi.fn(async () => ({})),
}));

vi.mock("@/lib/api-handler", async () => {
  const actual = await vi.importActual("@/lib/api-handler");
  return actual;
});

const mockPrisma = {} as any;

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

function makeMockPrisma() {
  return {
    progressLog: {
      create: vi
        .fn()
        .mockResolvedValue({ id: "pl1", userId: mockUser.id, value: 0, timestamp: new Date() }),
      findMany: vi.fn().mockResolvedValue([]),
      aggregate: vi.fn().mockResolvedValue({ _sum: { value: 0 } }),
      groupBy: vi.fn().mockResolvedValue([]),
    },
    goal: {
      create: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      update: vi.fn(),
      delete: vi.fn(),
    },
    badge: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    userBadge: {
      upsert: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn(),
    },
    inkPot: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    inkTx: {
      create: vi.fn().mockResolvedValue({}),
    },
    activity: {
      create: vi.fn().mockResolvedValue({}),
    },
  };
}

beforeEach(() => {
  Object.assign(mockPrisma, makeMockPrisma());
});

describe("Gamification API", () => {
  describe("Goals", () => {
    it("GET returns goals with progress", async () => {
      const { GET } = await import("@/app/api/gamification/goals/route");
      mockPrisma.goal.findMany.mockResolvedValue([
        {
          id: "g1",
          userId: mockUser.id,
          type: "words_per_day",
          target: 500,
          cadence: "daily",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      mockPrisma.progressLog.aggregate.mockResolvedValue({ _sum: { value: 342 } });

      const res = await GET();
      const data = await res.json();

      expect(Array.isArray(data)).toBe(true);
      expect(data[0].currentProgress).toBe(342);
    });

    it("POST creates a new goal", async () => {
      const { POST } = await import("@/app/api/gamification/goals/route");
      mockPrisma.goal.create.mockResolvedValue({
        id: "g2",
        userId: mockUser.id,
        type: "words_per_day",
        target: 1000,
        cadence: "daily",
      });

      const req = new Request("http://localhost/api/gamification/goals", {
        method: "POST",
        body: JSON.stringify({ type: "words_per_day", target: 1000 }),
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.target).toBe(1000);
    });
  });

  describe("Progress", () => {
    it("POST logs progress and earns ink", async () => {
      const { POST } = await import("@/app/api/gamification/progress/route");
      mockPrisma.progressLog.create.mockResolvedValue({
        id: "pl1",
        userId: mockUser.id,
        value: 1500,
        timestamp: new Date(),
      });
      mockPrisma.inkPot.upsert.mockResolvedValue({ id: "ink1", userId: mockUser.id, balance: 3 });
      mockPrisma.progressLog.aggregate.mockResolvedValue({ _sum: { value: 1500 } });

      const req = new Request("http://localhost/api/gamification/progress", {
        method: "POST",
        body: JSON.stringify({ value: 1500 }),
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(data.inkEarned).toBe(3);
      expect(data.totalWords).toBe(1500);
    });
  });

  describe("Wallet", () => {
    it("GET returns ink balance", async () => {
      const { GET } = await import("@/app/api/gamification/wallet/route");
      mockPrisma.inkPot.findUnique.mockResolvedValue({
        id: "pot1",
        userId: mockUser.id,
        balance: 42,
      });

      const res = await GET();
      const data = await res.json();

      expect(data.balance).toBe(42);
    });
  });

  describe("Badges", () => {
    it("GET returns earned badges", async () => {
      const { GET } = await import("@/app/api/gamification/badges/route");
      mockPrisma.userBadge.findMany.mockResolvedValue([
        {
          id: "ub1",
          userId: mockUser.id,
          badgeId: "badge_bronze",
          awardedAt: new Date(),
          badge: {
            id: "badge_bronze",
            name: "Bronze Quill",
            description: "1000 words",
            threshold: 1000,
            type: "total_words",
          },
        },
      ]);

      const res = await GET();
      const data = await res.json();

      expect(Array.isArray(data)).toBe(true);
      expect(data[0].badge.name).toBe("Bronze Quill");
    });
  });

  describe("Streak", () => {
    it("GET calculates current streak", async () => {
      const { GET } = await import("@/app/api/gamification/streak/route");
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      mockPrisma.progressLog.findMany.mockResolvedValue([
        { timestamp: today },
        { timestamp: yesterday },
      ]);

      const res = await GET();
      const data = await res.json();

      expect(data).toHaveProperty("streak");
      expect(data.streak).toBeGreaterThanOrEqual(0);
    });
  });
});
