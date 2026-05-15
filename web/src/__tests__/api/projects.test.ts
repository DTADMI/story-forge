import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  getUser: vi.fn(),
  requireUser: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/server";
import { GET, POST } from "@/app/api/projects/route";

function mockRequest(body?: unknown) {
  return {
    json: () => Promise.resolve(body ?? {}),
    nextUrl: new URL("http://localhost:3000/api/projects"),
    headers: new Headers(),
  } as unknown as Request;
}

describe("Projects API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/projects", () => {
    it("returns user projects", async () => {
      const mockUser = { id: "user-1", email: "test@test.com" };
      const mockProjects = [
        { id: "p1", title: "My Novel", userId: "user-1" },
        { id: "p2", title: "Screenplay", userId: "user-1" },
      ];

      (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
      (prisma.project.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjects);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        orderBy: { updatedAt: "desc" },
      });
    });

    it("returns 401 when unauthenticated", async () => {
      (requireUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Unauthorized"));

      await expect(GET()).rejects.toThrow("Unauthorized");
    });
  });

  describe("POST /api/projects", () => {
    it("creates a project", async () => {
      const mockUser = { id: "user-1" };
      const mockProject = { id: "new-1", title: "New Story", userId: "user-1" };

      (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        subscriptionTier: "creator",
        _count: { projects: 0 },
      });
      (prisma.project.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockProject);

      const response = await POST(mockRequest({ title: "New Story", description: "A story" }));
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe("New Story");
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: "New Story",
          userId: "user-1",
        }),
      });
    });

    it("defaults title to Untitled", async () => {
      const mockUser = { id: "user-1" };
      (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        subscriptionTier: "creator",
        _count: { projects: 0 },
      });
      (prisma.project.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "p1",
        title: "Untitled",
      });

      await POST(mockRequest({}));

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ title: "Untitled" }),
      });
    });
  });
});
