import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { update: vi.fn() },
    auditEvent: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

const mockConstructEvent = vi.fn();

vi.mock("stripe", () => ({
  default: vi.fn(() => ({
    webhooks: { constructEvent: mockConstructEvent },
  })),
}));

import { prisma } from "@/lib/prisma";

function mockRequest(body: string, signature?: string) {
  return {
    text: () => Promise.resolve(body),
    headers: new Map(Object.entries({
      "stripe-signature": signature || "test_sig",
      "content-type": "application/json",
    })) as unknown as Headers,
  } as unknown as Request;
}

describe("Billing Webhook API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_key";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it("returns 501 when stripe is not configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const { POST } = await import("@/app/api/billing/webhook/route");
    const res = await POST(mockRequest("{}"));
    expect(res.status).toBe(501);
    const data = await res.json();
    expect(data.error).toBe("Not configured");
  });

  it("returns 400 when signature is invalid", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const { POST } = await import("@/app/api/billing/webhook/route");
    const res = await POST(mockRequest("{}", "bad_sig"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid signature");
  });

  it("processes checkout.session.completed and updates user", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          client_reference_id: "user-1",
        },
      },
    });

    (prisma.user.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      subscriptionStatus: "active",
    });
    (prisma.auditEvent.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const { POST } = await import("@/app/api/billing/webhook/route");
    const res = await POST(mockRequest(JSON.stringify({
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_123", client_reference_id: "user-1" } },
    })));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: expect.objectContaining({
        subscriptionStatus: "active",
      }),
    });
  });

  it("ignores checkout.session.completed without userId", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {},
      },
    });

    const { POST } = await import("@/app/api/billing/webhook/route");
    const res = await POST(mockRequest(JSON.stringify({
      type: "checkout.session.completed",
      data: { object: {} },
    })));

    expect(res.status).toBe(200);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("ignores non-checkout events", async () => {
    mockConstructEvent.mockReturnValue({
      type: "invoice.payment_succeeded",
      data: { object: {} },
    });

    const { POST } = await import("@/app/api/billing/webhook/route");
    const res = await POST(mockRequest(JSON.stringify({
      type: "invoice.payment_succeeded",
    })));

    expect(res.status).toBe(200);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
