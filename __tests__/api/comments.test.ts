import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("@/lib/prisma", () => ({
  prisma: {
    comment: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), delete: vi.fn() },
    project: { findUnique: vi.fn() },
    activity: { create: vi.fn() },
  },
}));
vi.mock("@/lib/supabase/server", () => ({ getUser: vi.fn(), requireUser: vi.fn() }));
vi.mock("@/lib/activity", () => ({ createActivityAsync: vi.fn() }));
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/server";

describe("Comments API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns comments with replies", async () => {
    (requireUser as any).mockResolvedValue({ id: "user-1" });
    (prisma.comment.findMany as any).mockResolvedValue([{ id: "c1", content: "Nice!" }]);
    const { GET } = await import("@/app/api/projects/[id]/comments/route");
    const res = await GET({} as any, { params: Promise.resolve({ id: "p1" }) });
    expect(res.status).toBe(200);
  });

  it("POST creates comment and returns 201", async () => {
    (requireUser as any).mockResolvedValue({ id: "user-1" });
    (prisma.comment.create as any).mockResolvedValue({
      id: "c2",
      content: "Hello",
      user: { id: "user-1", name: "Test", username: "test", image: null },
    });
    (prisma.project.findUnique as any).mockResolvedValue(null);
    const { POST } = await import("@/app/api/projects/[id]/comments/route");
    const req = { json: () => Promise.resolve({ content: "Hello" }) } as any;
    const res = await POST(req, { params: Promise.resolve({ id: "p1" }) });
    expect(res.status).toBe(201);
  });

  it("POST rejects empty content", async () => {
    (requireUser as any).mockResolvedValue({ id: "user-1" });
    const { POST } = await import("@/app/api/projects/[id]/comments/route");
    const req = { json: () => Promise.resolve({ content: "" }) } as any;
    const res = await POST(req, { params: Promise.resolve({ id: "p1" }) });
    expect(res.status).toBe(400);
  });
});
