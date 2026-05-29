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
    competition: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    competitionEntry: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
    },
    auditEvent: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/audit", () => ({
  auditLog: vi.fn(),
}));

import { requireUser } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

describe("Competitions API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/competitions", () => {
    it("returns competitions list", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.competition.findMany as any).mockResolvedValue([
        { id: "c1", title: "Weekly Write-Off", status: "active", _count: { entries: 3 } },
      ]);
      const { GET } = await import("@/app/api/competitions/route");
      const res = await GET({ url: "http://localhost/api/competitions" } as any);
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe("c1");
    });

    it("filters by status", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.competition.findMany as any).mockResolvedValue([]);
      const { GET } = await import("@/app/api/competitions/route");
      const res = await GET({ url: "http://localhost/api/competitions?status=completed" } as any);
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/competitions", () => {
    it("admin creates a competition", async () => {
      (requireAdmin as any).mockResolvedValue(undefined);
      (requireUser as any).mockResolvedValue({ id: "admin-1" });
      (prisma.competition.create as any).mockResolvedValue({
        id: "c-new",
        title: "New Comp",
        status: "upcoming",
      });
      const { POST } = await import("@/app/api/competitions/route");
      const req = {
        json: () =>
          Promise.resolve({
            title: "New Comp",
            startDate: "2026-06-01",
            endDate: "2026-06-07",
            type: "weekly",
          }),
      } as any;
      const res = await POST(req);
      expect(res.status).toBe(201);
    });

    it("rejects invalid input", async () => {
      (requireAdmin as any).mockResolvedValue(undefined);
      (requireUser as any).mockResolvedValue({ id: "admin-1" });
      const { POST } = await import("@/app/api/competitions/route");
      const req = { json: () => Promise.resolve({}) } as any;
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/competitions/[id]", () => {
    it("returns competition with entries", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.competition.findUnique as any).mockResolvedValue({
        id: "c1",
        title: "Test",
        entries: [],
      });
      const { GET } = await import("@/app/api/competitions/[id]/route");
      const res = await GET({} as any, { params: Promise.resolve({ id: "c1" }) });
      expect(res.status).toBe(200);
    });

    it("returns 404 for missing competition", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.competition.findUnique as any).mockResolvedValue(null);
      const { GET } = await import("@/app/api/competitions/[id]/route");
      const res = await GET({} as any, { params: Promise.resolve({ id: "bad" }) });
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/competitions/[id]/enter", () => {
    it("enters a valid project", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.competition.findUnique as any).mockResolvedValue({
        id: "c1",
        status: "active",
        minWords: 100,
        maxWords: null,
      });
      (prisma.project.findFirst as any).mockResolvedValue({
        id: "p1",
        userId: "user-1",
        isPublic: true,
        wordCount: 500,
      });
      (prisma.competitionEntry.findUnique as any).mockResolvedValue(null);
      (prisma.competitionEntry.create as any).mockResolvedValue({
        id: "e1",
        competitionId: "c1",
        projectId: "p1",
        userId: "user-1",
      });
      const { POST } = await import("@/app/api/competitions/[id]/enter/route");
      const req = { json: () => Promise.resolve({ projectId: "p1" }) } as any;
      const res = await POST(req, { params: Promise.resolve({ id: "c1" }) });
      expect(res.status).toBe(201);
    });

    it("rejects if project is not public", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.competition.findUnique as any).mockResolvedValue({
        id: "c1",
        status: "active",
        minWords: 100,
        maxWords: null,
      });
      (prisma.project.findFirst as any).mockResolvedValue({
        id: "p1",
        userId: "user-1",
        isPublic: false,
        wordCount: 500,
      });
      const { POST } = await import("@/app/api/competitions/[id]/enter/route");
      const req = { json: () => Promise.resolve({ projectId: "p1" }) } as any;
      const res = await POST(req, { params: Promise.resolve({ id: "c1" }) });
      expect(res.status).toBe(400);
    });

    it("rejects below minimum word count", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.competition.findUnique as any).mockResolvedValue({
        id: "c1",
        status: "active",
        minWords: 1000,
        maxWords: null,
      });
      (prisma.project.findFirst as any).mockResolvedValue({
        id: "p1",
        userId: "user-1",
        isPublic: true,
        wordCount: 50,
      });
      const { POST } = await import("@/app/api/competitions/[id]/enter/route");
      const req = { json: () => Promise.resolve({ projectId: "p1" }) } as any;
      const res = await POST(req, { params: Promise.resolve({ id: "c1" }) });
      expect(res.status).toBe(400);
    });
  });
});
