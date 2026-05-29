import { describe, it, expect, vi, beforeEach } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock("@/lib/supabase/server", () => ({
  requireUser: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    location: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    species: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    organization: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    dialogue: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/neo4j-sync", () => ({
  syncCharacterToNeo4j: vi.fn(),
  syncLocationToNeo4j: vi.fn(),
}));

import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

describe("World Building API", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /api/world/locations", () => {
    it("returns user locations", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.location.findMany as any).mockResolvedValue([
        { id: "l1", name: "The Castle", projectId: "p1" },
      ]);
      const { GET } = await import("@/app/api/world/locations/route");
      const res = await GET({ url: "http://localhost/api/world/locations" } as any);
      expect(res.status).toBe(200);
    });

    it("filters by projectId", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.location.findMany as any).mockResolvedValue([]);
      const { GET } = await import("@/app/api/world/locations/route");
      const res = await GET({
        url: "http://localhost/api/world/locations?projectId=p1",
      } as any);
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/world/locations", () => {
    it("creates a location", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.location.create as any).mockResolvedValue({
        id: "l2",
        name: "Forest",
        userId: "user-1",
        projectId: "p1",
      });
      const { POST } = await import("@/app/api/world/locations/route");
      const req = {
        json: () => Promise.resolve({ name: "Forest", projectId: "p1" }),
      } as any;
      const res = await POST(req);
      expect(res.status).toBe(201);
    });

    it("rejects empty name", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      const { POST } = await import("@/app/api/world/locations/route");
      const req = { json: () => Promise.resolve({ name: "" }) } as any;
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/world/species", () => {
    it("returns species list", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.species.findMany as any).mockResolvedValue([
        { id: "s1", name: "Elves", traits: "Agile" },
      ]);
      const { GET } = await import("@/app/api/world/species/route");
      const res = await GET({ url: "http://localhost/api/world/species" } as any);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/world/organizations", () => {
    it("returns organizations list", async () => {
      (requireUser as any).mockResolvedValue({ id: "user-1" });
      (prisma.organization.findMany as any).mockResolvedValue([
        { id: "o1", name: "The Guild", type: "guild" },
      ]);
      const { GET } = await import("@/app/api/world/organizations/route");
      const res = await GET({ url: "http://localhost/api/world/organizations" } as any);
      expect(res.status).toBe(200);
    });
  });
});
