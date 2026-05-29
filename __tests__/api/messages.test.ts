import { describe, it, expect, vi, beforeEach } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock("@/lib/supabase/server", () => ({
  requireUser: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@/lib/admin", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    message: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    userBlock: {
      findFirst: vi.fn(),
    },
    activity: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/activity", () => ({
  createActivityAsync: vi.fn(),
}));

import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

describe("Messages API", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("POST /api/messages", () => {
    it("creates a message", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.message.create as any).mockResolvedValue({
        id: "m1",
        content: "Hello",
        senderId: "user-1",
        receiverId: "user-2",
      });
      const { POST } = await import("@/app/api/messages/route");
      const req = {
        json: () => Promise.resolve({ receiverId: "user-2", content: "Hello" }),
      } as any;
      const res = await POST(req);
      expect(res.status).toBe(201);
    });

    it("rejects empty content", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      const { POST } = await import("@/app/api/messages/route");
      const req = {
        json: () => Promise.resolve({ receiverId: "user-2", content: "" }),
      } as any;
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("rejects missing receiverId", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      const { POST } = await import("@/app/api/messages/route");
      const req = { json: () => Promise.resolve({ content: "Hello" }) } as any;
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/messages", () => {
    it("returns conversations list", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.message.findMany as any).mockResolvedValue([
        { id: "m1", senderId: "user-1", content: "Hi" },
      ]);
      const { GET } = await import("@/app/api/messages/route");
      const res = await GET({ url: "http://localhost/api/messages" } as any);
      expect(res.status).toBe(200);
    });

    it("filters by partner", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.message.findMany as any).mockResolvedValue([]);
      const { GET } = await import("@/app/api/messages/route");
      const res = await GET({
        url: "http://localhost/api/messages?with=user-2",
      } as any);
      expect(res.status).toBe(200);
    });
  });
});
