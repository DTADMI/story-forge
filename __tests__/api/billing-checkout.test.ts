import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(),
}));

import { requireUser } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

function mockRequest(body?: unknown) {
  return {
    json: () => Promise.resolve(body ?? {}),
  } as unknown as Request;
}

describe("Billing Checkout API", () => {
  const mockStripeCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (getStripe as ReturnType<typeof vi.fn>).mockReturnValue({
      checkout: { sessions: { create: mockStripeCreate } },
    });
    process.env.STRIPE_PRICE_PREMIUM_MONTHLY = "price_monthly";
    process.env.STRIPE_PRICE_PREMIUM_YEARLY = "price_yearly";
    process.env.STRIPE_PRICE_PREMIUM_LIFETIME = "price_lifetime";
  });

  afterEach(() => {
    delete process.env.STRIPE_PRICE_PREMIUM_MONTHLY;
    delete process.env.STRIPE_PRICE_PREMIUM_YEARLY;
    delete process.env.STRIPE_PRICE_PREMIUM_LIFETIME;
  });

  it("returns 401 when unauthenticated", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Unauthorized"));
    const { POST } = await import("@/app/api/billing/checkout/route");
    const res = await POST(mockRequest({ plan: "monthly" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid plan", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });
    const { POST } = await import("@/app/api/billing/checkout/route");
    const res = await POST(mockRequest({ plan: "invalid" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("Invalid plan");
  });

  it("returns 400 when plan is missing", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });
    const { POST } = await import("@/app/api/billing/checkout/route");
    const res = await POST(mockRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 501 when price not configured for plan", async () => {
    delete process.env.STRIPE_PRICE_PREMIUM_MONTHLY;
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });
    const { POST } = await import("@/app/api/billing/checkout/route");
    const res = await POST(mockRequest({ plan: "monthly" }));
    expect(res.status).toBe(501);
    const data = await res.json();
    expect(data.message).toBe("Pricing not configured for this plan");
  });

  it("creates subscription session for monthly plan", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });
    mockStripeCreate.mockResolvedValue({ url: "https://checkout.stripe.com/session_123" });

    const { POST } = await import("@/app/api/billing/checkout/route");
    const res = await POST(mockRequest({ plan: "monthly" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.url).toBe("https://checkout.stripe.com/session_123");
    expect(mockStripeCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        line_items: [{ price: "price_monthly", quantity: 1 }],
        client_reference_id: "user-1",
      })
    );
  });

  it("creates payment session for lifetime plan", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });
    mockStripeCreate.mockResolvedValue({ url: "https://checkout.stripe.com/session_456" });

    const { POST } = await import("@/app/api/billing/checkout/route");
    const res = await POST(mockRequest({ plan: "lifetime" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.url).toBe("https://checkout.stripe.com/session_456");
    expect(mockStripeCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        line_items: [{ price: "price_lifetime", quantity: 1 }],
        client_reference_id: "user-1",
      })
    );
  });

  it("does not include subscription_data for lifetime plan", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });
    mockStripeCreate.mockResolvedValue({ url: "https://checkout.stripe.com/session_789" });

    const { POST } = await import("@/app/api/billing/checkout/route");
    await POST(mockRequest({ plan: "lifetime" }));

    const callArgs = mockStripeCreate.mock.calls[0][0];
    expect(callArgs).not.toHaveProperty("subscription_data");
  });

  it("includes subscription_data for monthly plan", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });
    mockStripeCreate.mockResolvedValue({ url: "https://checkout.stripe.com/session_abc" });

    const { POST } = await import("@/app/api/billing/checkout/route");
    await POST(mockRequest({ plan: "monthly" }));

    const callArgs = mockStripeCreate.mock.calls[0][0];
    expect(callArgs).toHaveProperty("subscription_data");
    expect(callArgs.subscription_data.metadata.userId).toBe("user-1");
  });

  it("returns 500 when Stripe call fails", async () => {
    (requireUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });
    mockStripeCreate.mockRejectedValue(new Error("Stripe API error"));

    const { POST } = await import("@/app/api/billing/checkout/route");
    const res = await POST(mockRequest({ plan: "monthly" }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.message).toBe("Failed to create checkout session");
  });
});
