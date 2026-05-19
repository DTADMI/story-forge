import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/lib/audit", () => ({
  auditLog: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/server";

function mockRequest(body?: unknown) {
  return {
    json: () => Promise.resolve(body ?? {}),
  } as unknown as Request;
}

function mockParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("Users API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/users/[id]", () => {
    it("returns user profile", async () => {
      const mockUser = {
        id: "user-1",
        name: "Test User",
        username: "testuser",
        bio: "A writer",
        website: "https://example.com",
        image: null,
        createdAt: new Date("2025-01-01"),
      };

      (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

      const { GET } = await import("@/app/api/users/[id]/route");
      const res = await GET(mockRequest(), mockParams("user-1"));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe("Test User");
      expect(data.username).toBe("testuser");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
        select: {
          id: true,
          name: true,
          username: true,
          bio: true,
          website: true,
          image: true,
          createdAt: true,
        },
      });
    });

    it("returns 401 when unauthenticated", async () => {
      (requireUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Unauthorized"));

      const { GET } = await import("@/app/api/users/[id]/route");
      const res = await GET(mockRequest(), mockParams("user-1"));
      expect(res.status).toBe(401);
    });

    it("returns 404 when user not found", async () => {
      (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { GET } = await import("@/app/api/users/[id]/route");
      const res = await GET(mockRequest(), mockParams("nonexistent"));
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Not found");
    });
  });

  describe("PATCH /api/users/[id]", () => {
    it("updates own profile", async () => {
      (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });
      (prisma.user.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "user-1",
        name: "Updated Name",
      });

      const { PATCH } = await import("@/app/api/users/[id]/route");
      const res = await PATCH(
        mockRequest({ name: "Updated Name" }),
        mockParams("user-1")
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe("Updated Name");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { name: "Updated Name" },
      });
    });

    it("returns 403 when updating another user", async () => {
      (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });

      const { PATCH } = await import("@/app/api/users/[id]/route");
      const res = await PATCH(
        mockRequest({ name: "Hacker" }),
        mockParams("user-2")
      );
      expect(res.status).toBe(403);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("updates profile with settings fields", async () => {
      (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: { breakReminders: true },
      });
      (prisma.user.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "user-1",
        settings: { breakReminders: false, writingCap: 1000 },
      });

      const { PATCH } = await import("@/app/api/users/[id]/route");
      const res = await PATCH(
        mockRequest({ breakReminders: false, writingCap: 1000 }),
        mockParams("user-1")
      );

      expect(res.status).toBe(200);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: expect.objectContaining({
          settings: expect.objectContaining({
            breakReminders: false,
            writingCap: 1000,
          }),
        }),
      });
    });

    it("returns 401 when unauthenticated", async () => {
      (requireUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Unauthorized"));

      const { PATCH } = await import("@/app/api/users/[id]/route");
      const res = await PATCH(
        mockRequest({ name: "Test" }),
        mockParams("user-1")
      );
      expect(res.status).toBe(401);
    });
  });
});
