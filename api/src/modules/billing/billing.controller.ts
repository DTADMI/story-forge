import {BadRequestException, Body, Controller, Headers, NotFoundException, Post, Req, UseGuards,} from '@nestjs/common';
import {isApiFlagEnabled} from '../../config/flags';
import {ApiAuthGuard} from '../../common/auth/api-auth.guard';
import {CurrentUser} from '../../common/auth/current-user.decorator';
import {WriteRateLimitGuard} from '../../common/guards/rate-limit.guard';
import Stripe from 'stripe';
import {getEnv} from '../../config/env';
import {PrismaService} from '../../common/prisma/prisma.service';
import type {Request} from 'express';

@Controller('billing')
export class BillingController {
    private stripe: Stripe | null;

    constructor(private readonly prisma: PrismaService) {
        const e = getEnv();
        this.stripe = e.STRIPE_SECRET_KEY
            ? new Stripe(e.STRIPE_SECRET_KEY, {apiVersion: '2024-06-20'})
            : null;
    }

    @Post('checkout')
    @UseGuards(ApiAuthGuard, WriteRateLimitGuard)
    async createCheckout(
        @CurrentUser() user: { id: string } | undefined,
        @Body()
        body: {
            plan?: 'monthly' | 'yearly';
            successUrl?: string;
            cancelUrl?: string;
        }
    ) {
        if (!isApiFlagEnabled('payments')) {
            throw new NotFoundException();
        }
        if (!user?.id) throw new BadRequestException('Unauthorized');

        const plan = body.plan || 'monthly';
        if (plan !== 'monthly' && plan !== 'yearly') {
            throw new BadRequestException('Invalid plan');
        }

        if (!this.stripe) {
            throw new BadRequestException('Stripe not configured');
        }
        const e = getEnv();
        const price =
            plan === 'yearly'
                ? e.STRIPE_PRICE_PREMIUM_YEARLY
                : e.STRIPE_PRICE_PREMIUM_MONTHLY;
        if (!price) throw new BadRequestException('Price not configured');

        // Success/Cancel URLs must be absolute; expect client to pass them
        const success_url =
            body.successUrl ??
            `${process.env.ALLOWED_ORIGINS?.split(',')[0] ?? ''}/billing/return?status=success`;
        const cancel_url =
            body.cancelUrl ??
            `${process.env.ALLOWED_ORIGINS?.split(',')[0] ?? ''}/billing/return?status=canceled`;

        // Attach userId in metadata for webhook to update subscription status
        const session = await this.stripe.checkout.sessions.create({
            mode: 'subscription',
            success_url,
            cancel_url,
            line_items: [{price, quantity: 1}],
            metadata: {
                userId: user.id,
                plan,
            },
        });
        return {url: session.url} as const;
    }

    @Post('webhook')
    async webhook(
        @Headers('stripe-signature') signature: string | undefined,
        @Body() payload: any,
        @Req() req: Request & { rawBody?: Buffer }
    ) {
        if (!isApiFlagEnabled('payments')) {
            throw new NotFoundException();
        }
        if (!this.stripe) throw new BadRequestException('Stripe not configured');
        const e = getEnv();
        if (!e.STRIPE_WEBHOOK_SECRET)
            throw new BadRequestException('Webhook secret not configured');
        if (!signature)
            throw new BadRequestException('Missing Stripe-Signature header');

        // Attempt to verify using raw body when available
        let event: Stripe.Event;
        try {
            const raw = (req as any).rawBody
                ? (req as any).rawBody
                : Buffer.from(JSON.stringify(payload));
            event = this.stripe.webhooks.constructEvent(
                raw,
                signature,
                e.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            throw new BadRequestException('Invalid webhook signature');
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = (session.metadata as any)?.userId as string | undefined;
            const plan = (session.metadata as any)?.plan as string | undefined;
            if (userId) {
                const expiresAt = new Date();
                if (plan === 'yearly') {
                    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
                } else {
                    expiresAt.setMonth(expiresAt.getMonth() + 1);
                }

                await this.prisma.user
                    .update({
                        where: {id: userId},
                        data: {
                            subscriptionStatus: 'active',
                            subscriptionExpiresAt: expiresAt,
                        },
                    })
                    .catch(() => void 0);
            }
        }
        return {received: true};
    }
}
