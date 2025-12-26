import request from 'supertest';
import * as jwt from 'jsonwebtoken';
import {Test} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {AppModule} from '../src/app.module';

describe('Projects (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('GET /projects should return 200 and an array (authorized)', async () => {
        const server = app.getHttpServer();
        const secret = process.env.API_JWT_SECRET || 'testsecret';
        const token = jwt.sign({uid: 'test-user'}, secret, {algorithm: 'HS256', expiresIn: '5m'});
        const res = await request(server)
            .get('/projects')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /projects should return 401 without auth', async () => {
        const server = app.getHttpServer();
        await request(server).get('/projects').expect(401);
    });
});
