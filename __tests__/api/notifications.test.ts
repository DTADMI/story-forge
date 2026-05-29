import { describe, it, expect, vi, beforeEach } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */

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

import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

describe("Notifications API", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /api/notifications", () => {
    it("returns user notifications", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.notification.findMany as any).mockResolvedValue([
        { id: "n1", type: "follow", read: false },
        { id: "n2", type: "cheer", read: true },
      ]);
      (prisma.notification.count as any).mockResolvedValue(1);
      const { GET } = await import("@/app/api/notifications/route");
      const res = await GET({ url: "http://localhost/api/notifications" } as any);
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /api/notifications/[id]/read", () => {
    it("marks notification as read", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.notification.findFirst as any).mockResolvedValue({
        id: "n1",
        userId: "user-1",
      });
      (prisma.notification.update as any).mockResolvedValue({
        id: "n1",
        read: true,
      });
      const { PATCH } = await import("@/app/api/notifications/[id]/read/route");
      const res = await PATCH({} as any, {
        params: Promise.resolve({ id: "n1" }),
      });
      expect(res.status).toBe(200);
    });

    it("returns 404 for missing notification", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.notification.findFirst as any).mockResolvedValue(null);
      const { PATCH } = await import("@/app/api/notifications/[id]/read/route");
      const res = await PATCH({} as any, {
        params: Promise.resolve({ id: "bad" }),
      });
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/notifications", () => {
    it("marks all as read", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.notification.updateMany as any).mockResolvedValue({ count: 5 });
      const { PATCH } = await import("@/app/api/notifications/route");
      const req = { json: () => Promise.resolve({ markAllRead: true }) } as any;
      const res = await PATCH(req);
      expect(res.status).toBe(200);
    });
  });
});
