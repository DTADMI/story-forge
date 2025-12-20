import {Body, Controller, NotFoundException, Post} from '@nestjs/common';
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
}
