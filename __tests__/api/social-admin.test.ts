import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

vi.mock("@/lib/supabase/cache", () => ({
  redis: { get: vi.fn(), set: vi.fn(), del: vi.fn() },
}));

vi.mock("@/lib/redis", () => ({
  redis: { get: vi.fn(), set: vi.fn(), del: vi.fn() },
}));

vi.mock("@/lib/supabase/server", () => ({
  requireUser: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    follow: {
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    block: {
      create: vi.fn(),
      delete: vi.fn(),
    },
    group: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    groupMember: {
      create: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/server";

function mockRequest(body?: unknown) {
  return {
    json: () => Promise.resolve(body ?? {}),
    url: "http://localhost:3000",
  } as unknown as Request;
}

describe("Social API", () => {
  beforeAll(() => {
    vi.mock("@/lib/auth", () => ({}));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
    });
  });

  describe("POST /api/social/groups", () => {
    it("returns followers list", async () => {
      (prisma.follow.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: "f-1", follower: { id: "user-2", name: "Alice" } },
      ]);

      const { GET } = await import("@/app/api/social/followers/route");
      const req = mockRequest();
      const res = await GET(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("GET /api/social/following", () => {
    it("returns following list", async () => {
      (prisma.follow.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: "f-1", following: { id: "user-2", name: "Bob" } },
      ]);

      const { GET } = await import("@/app/api/social/following/route");
      const req = mockRequest();
      const res = await GET(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("POST /api/social/groups", () => {
    it("creates a group", async () => {
      (prisma.group.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "g-1",
        name: "My Group",
        creatorId: "user-1",
      });

      const { POST } = await import("@/app/api/social/groups/route");
      const req = mockRequest({ name: "My Group", description: "A test group" });
      const res = await POST(req);

      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.name).toBe("My Group");
    });

    it("rejects empty name", async () => {
      const { POST } = await import("@/app/api/social/groups/route");
      const req = mockRequest({ name: "" });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/social/groups", () => {
    it("returns groups list", async () => {
      (prisma.group.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: "g-1", name: "Test Group" },
      ]);

      const { GET } = await import("@/app/api/social/groups/route");
      const req = mockRequest();
      const res = await GET(req);

      expect(res.ok).toBe(true);
    });
  });
});
