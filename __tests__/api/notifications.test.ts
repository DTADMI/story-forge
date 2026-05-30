import { describe, it, expect, vi, beforeEach } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock("@/lib/api-handler", () => ({
  withErrorHandler: (handler: any) => handler,
}));

vi.mock("@/lib/supabase/server", () => ({
  requireUser: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/lib/activity", () => ({
  createActivityAsync: vi.fn(),
}));

vi.mock("@/lib/error-response", () => ({
  validationError: (msg: string) => new Response(JSON.stringify({ error: msg }), { status: 400 }),
  notFound: (msg: string) => new Response(JSON.stringify({ error: msg }), { status: 404 }),
}));

import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

describe("Notifications API", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /api/notifications", () => {
    it("returns user notifications", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.notification.findMany as any).mockResolvedValue([
        { id: "n1", type: "follow", read: false },
      ]);
      const { GET } = await import("@/app/api/notifications/route");
      const res = await GET({} as any);
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/notifications/[id]/read", () => {
    it("marks notification as read", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.notification.findFirst as any).mockResolvedValue({ id: "n1", userId: "user-1" });
      (prisma.notification.updateMany as any).mockResolvedValue({ count: 1 });
      const { POST } = await import("@/app/api/notifications/[id]/read/route");
      const res = await POST({} as any, { params: Promise.resolve({ id: "n1" }) });
      expect(res.status).toBe(200);
    });

    it("returns success even without notification", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.notification.updateMany as any).mockResolvedValue({ count: 0 });
      const { POST } = await import("@/app/api/notifications/[id]/read/route");
      const res = await POST({} as any, { params: Promise.resolve({ id: "bad" }) });
      expect(res.status).toBe(200);
    });
  });
});
