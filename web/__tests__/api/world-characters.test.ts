import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("@/lib/prisma", () => ({ prisma: { character: { findMany: vi.fn(), create: vi.fn() } } }));
vi.mock("@/lib/supabase/server", () => ({ requireUser: vi.fn() }));
vi.mock("@/lib/neo4j-sync", () => ({ syncCharacterToNeo4j: vi.fn() }));
import { requireUser } from "@/lib/supabase/server";

describe("Characters API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns 401 when unauthenticated", async () => {
    (requireUser as any).mockRejectedValue(new Error("Unauthorized"));
    const { GET } = await import("@/app/api/world/characters/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("POST returns 400 when name is missing", async () => {
    (requireUser as any).mockResolvedValue({ id: "user-1" });
    const { POST } = await import("@/app/api/world/characters/route");
    const req = { json: () => Promise.resolve({}) } as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
