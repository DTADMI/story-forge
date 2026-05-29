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
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    featureFlag: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    auditEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/audit", () => ({
  auditLog: vi.fn(),
}));

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

describe("Admin API", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /api/admin/users", () => {
    it("returns paginated user list", async () => {
      (requireAdmin as any).mockResolvedValue(undefined);
      (prisma.user.findMany as any).mockResolvedValue([
        { id: "u1", email: "a@b.com", name: "Alice", subscriptionTier: "pro" },
        { id: "u2", email: "c@d.com", name: "Bob", subscriptionTier: "free" },
      ]);
      const { GET } = await import("@/app/api/admin/users/route");
      const res = await GET({ url: "http://localhost/api/admin/users?take=20" } as any);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/admin/flags", () => {
    it("returns feature flags", async () => {
      (requireAdmin as any).mockResolvedValue(undefined);
      (prisma.featureFlag.findMany as any).mockResolvedValue([
        { id: "f1", name: "Payments", enabled: false },
      ]);
      const { GET } = await import("@/app/api/admin/flags/route");
      const res = await GET({} as any);
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /api/admin/users/[id]", () => {
    it("updates user subscription tier", async () => {
      (requireAdmin as any).mockResolvedValue(undefined);
      (requireUser as any).mockResolvedValue({ id: "admin-1" });
      (prisma.user.update as any).mockResolvedValue({
        id: "u1",
        subscriptionTier: "pro",
      });
      const { PATCH } = await import("@/app/api/admin/users/[id]/route");
      const req = { json: () => Promise.resolve({ subscriptionTier: "pro" }) } as any;
      const res = await PATCH(req, { params: Promise.resolve({ id: "u1" }) });
      expect(res.status).toBe(200);
    });
  });
});
