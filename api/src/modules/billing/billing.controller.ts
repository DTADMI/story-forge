import {Body, Controller, NotFoundException, Post} from '@nestjs/common';
import {isApiFlagEnabled} from '../../config/flags';

@Controller('billing')
export class BillingController {
    @Post('checkout')
    async createCheckout(@Body() body: {
        plan: 'monthly' | 'yearly' | 'lifetime';
        successUrl?: string;
        cancelUrl?: string
    }) {
        if (!isApiFlagEnabled('payments')) {
            throw new NotFoundException();
        }
        // Stripe integration will be implemented next: create Checkout Session, return { url }
        // Stub for now
        return {status: 'not_implemented', message: 'Payments disabled or not implemented yet'} as const;
    }
}
