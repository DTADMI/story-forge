import { describe, it, expect, vi, beforeEach } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock("@/lib/api-handler", () => ({
  withErrorHandler: (handler: any) => handler,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  RateLimitTiers: {
    WRITE: { maxRequests: 60, keyPrefix: "rate:write" },
    READ: { maxRequests: 300, keyPrefix: "rate:read" },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  requireUser: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@/lib/error-response", () => ({
  validationError: (msg: string) => new Response(JSON.stringify({ error: msg }), { status: 400 }),
  notFound: (msg: string) => new Response(JSON.stringify({ error: msg }), { status: 404 }),
}));

vi.mock("@/lib/audit", () => ({
  auditLog: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    message: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    userBlock: { findFirst: vi.fn().mockResolvedValue(null) },
    user: { findUnique: vi.fn() },
    activity: { create: vi.fn() },
    notification: { create: vi.fn() },
  },
}));

vi.mock("@/lib/activity", () => ({
  createActivityAsync: vi.fn(),
}));

import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function mockRequest(body?: Record<string, unknown>, url = "http://localhost/api/messages") {
  return {
    json: () => Promise.resolve(body ?? {}),
    url,
    headers: new Map([["x-forwarded-for", "127.0.0.1"]]),
  } as unknown as any;
}

describe("Messages API", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("POST /api/messages", () => {
    it("creates a message", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.user.findUnique as any).mockResolvedValue({ id: "user-2" });
      (prisma.message.create as any).mockResolvedValue({
        id: "m1",
        content: "Hello",
        senderId: "user-1",
        receiverId: "user-2",
        createdAt: new Date(),
        read: false,
      });
      const { POST } = await import("@/app/api/messages/route");
      const req = mockRequest({ receiverId: "user-2", content: "Hello" });
      const res = await POST(req);
      expect(res.status).toBe(201);
    });

    it("rejects empty content", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.user.findUnique as any).mockResolvedValue({ id: "user-2" });
      const { POST } = await import("@/app/api/messages/route");
      const req = mockRequest({ receiverId: "user-2", content: "" });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("rejects missing receiverId", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      const { POST } = await import("@/app/api/messages/route");
      const req = mockRequest({ content: "Hello" });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/messages", () => {
    it("returns conversations list", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.message.findMany as any).mockResolvedValue([]);
      const { GET } = await import("@/app/api/messages/route");
      const res = await GET(mockRequest(undefined, "http://localhost/api/messages"));
      expect(res.status).toBe(200);
    });

    it("filters by partner", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.message.findMany as any).mockResolvedValue([]);
      const { GET } = await import("@/app/api/messages/route");
      const res = await GET(mockRequest(undefined, "http://localhost/api/messages?with=user-2"));
      expect(res.status).toBe(200);
    });
  });
});
