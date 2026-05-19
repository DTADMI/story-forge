import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { requireUser } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const { plan } = (await request.json()) as { plan?: string };
    if (!plan || !["monthly", "yearly", "lifetime"].includes(plan)) {
      return NextResponse.json({ message: "Invalid plan" }, { status: 400 });
    }

    const stripe = getStripe();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const priceIds: Record<string, string | undefined> = {
      monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
      yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
      lifetime: process.env.STRIPE_PRICE_PREMIUM_LIFETIME,
    };

    const priceId = priceIds[plan];
    if (!priceId) {
      return NextResponse.json(
        { message: "Pricing not configured for this plan" },
        { status: 501 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: plan === "lifetime" ? "payment" : "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: user.id,
      success_url: `${siteUrl}/dashboard?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
      ...(plan === "lifetime"
        ? {}
        : {
            subscription_data: {
              metadata: { userId: user.id },
            },
          }),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("Checkout error:", error);
    return NextResponse.json(
      { message: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
