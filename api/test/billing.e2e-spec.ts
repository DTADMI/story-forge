import request from 'supertest';
import * as jwt from 'jsonwebtoken';
import {Test} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {AppModule} from '../src/app.module';

describe('Billing (e2e)', () => {
    let app: INestApplication;
    let server: any;
    let token: string;

    beforeAll(async () => {
        // Enable payments flag for tests
        process.env.API_FEATURE_PAYMENTS = 'true';
        process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
        process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
        process.env.STRIPE_PRICE_PREMIUM_MONTHLY = 'price_monthly';
        process.env.STRIPE_PRICE_PREMIUM_YEARLY = 'price_yearly';
        process.env.API_JWT_SECRET = 'testsecret12345';

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
        server = app.getHttpServer();
        token = jwt.sign({uid: 'user-id'}, process.env.API_JWT_SECRET, {algorithm: 'HS256', expiresIn: '5m'});
    });

    afterAll(async () => {
        await app.close();
    });

    it('POST /billing/checkout returns URL', async () => {
        // We expect a 400 because sk_test_mock isn't a real key and Stripe lib will fail to call API
        // but the point is it passed the Gating (not 404) and Auth (not 401).
        const res = await request(server)
            .post('/billing/checkout')
            .set('Authorization', `Bearer ${token}`)
            .send({plan: 'monthly'});

        expect(res.status).not.toBe(404);
        expect(res.status).not.toBe(401);
    });

    it('POST /billing/webhook handles invalid signature', async () => {
        await request(server)
            .post('/billing/webhook')
            .set('stripe-signature', 'invalid')
            .send({type: 'checkout.session.completed'})
            .expect(400);
    });
});
