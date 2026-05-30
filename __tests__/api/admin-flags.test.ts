import { describe, it, expect, vi, beforeEach } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock("@/lib/api-handler", () => ({
  withErrorHandler: (handler: any) => handler,
}));

vi.mock("@/lib/supabase/server", () => ({
  requireUser: vi.fn(),
  getUser: vi.fn(),
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/admin", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/flags-server", () => ({
  isEnabled: vi.fn().mockResolvedValue(true),
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

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  RateLimitTiers: { WRITE: { maxRequests: 60, keyPrefix: "rate:write" } },
}));

vi.mock("@/lib/error-response", () => ({
  validationError: (msg: string) => new Response(JSON.stringify({ error: msg }), { status: 400 }),
  notFound: (msg: string) => new Response(JSON.stringify({ error: msg }), { status: 404 }),
}));

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

describe("Admin API", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /api/admin/users", () => {
    it("returns paginated user list", async () => {
      (requireAdmin as any).mockResolvedValue(undefined);
      (prisma.user.findMany as any).mockResolvedValue([
        { id: "u1", email: "a@b.com", name: "Alice" },
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
});
