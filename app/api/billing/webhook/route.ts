import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret)
    return NextResponse.json({ error: "Not configured" }, { status: 501 });

  const stripe = new Stripe(stripeKey);
  const sig = request.headers.get("stripe-signature")!;
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    if (userId && session.id) {
      const idempotencyKey = `stripe_checkout_${session.id}`;
      const existing = await prisma.auditEvent.findFirst({
        where: { action: "stripe.checkout.completed", entityId: idempotencyKey },
      });
      if (existing) return NextResponse.json({ received: true, deduplicated: true });

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: "active",
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.auditEvent.create({
        data: {
          userId,
          action: "stripe.checkout.completed",
          entityId: idempotencyKey,
          entityType: "stripe_session",
          metadata: { sessionId: session.id, mode: session.mode },
        },
      } as any);
    }
  }

  return NextResponse.json({ received: true });
}
