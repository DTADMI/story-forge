import {BadRequestException, Body, Controller, Headers, NotFoundException, Post} from '@nestjs/common';
import {isApiFlagEnabled} from '../../config/flags';

@Controller('billing')
export class BillingController {
    @Post('checkout')
    async createCheckout(@Body() body: {
        plan: 'monthly' | 'yearly';
        successUrl?: string;
        cancelUrl?: string
    }) {
        if (!isApiFlagEnabled('payments')) {
            throw new NotFoundException();
        }
        // TODO: Integrate Stripe Checkout here and return the session URL
        const url = body?.successUrl || '#checkout-stub';
        return {url} as const;
    }

    @Post('webhook')
    async webhook(
        @Headers('stripe-signature') signature: string | undefined,
        @Body() payload: any
    ) {
        if (!isApiFlagEnabled('payments')) {
            throw new NotFoundException();
        }
        // Minimal stub: in real implementation, verify signature using STRIPE_WEBHOOK_SECRET and Stripe SDK
        if (!signature) {
            throw new BadRequestException('Missing Stripe-Signature header');
        }
        // Optionally react to event types e.g., checkout.session.completed
        return {received: true};
    }
}
