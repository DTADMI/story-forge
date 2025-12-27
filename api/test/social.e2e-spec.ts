import request from 'supertest';
import * as jwt from 'jsonwebtoken';
import {Test} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {AppModule} from '../src/app.module';

describe('Social (e2e)', () => {
    let app: INestApplication;
    let server: any;
    let tokenA: string;
    let tokenB: string;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
        server = app.getHttpServer();
        const secret = process.env.API_JWT_SECRET || 'testsecret';
        tokenA = jwt.sign({uid: 'user-a'}, secret, {
            algorithm: 'HS256',
            expiresIn: '5m',
        });
        tokenB = jwt.sign({uid: 'user-b'}, secret, {
            algorithm: 'HS256',
            expiresIn: '5m',
        });
    });

    afterAll(async () => {
        await app.close();
    });

    it('POST /social/follow toggles follow state', async () => {
        const followRes = await request(server)
            .post('/social/follow')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({userId: 'user-b'})
            .expect(201);
        expect(followRes.body).toEqual({following: true});

        const unfollowRes = await request(server)
            .post('/social/follow')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({userId: 'user-b'})
            .expect(201);
        expect(unfollowRes.body).toEqual({following: false});
    });

    it('GET /social/followers and /social/following list data', async () => {
        // Ensure A follows B
        await request(server)
            .post('/social/follow')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({userId: 'user-b'})
            .expect(201);

        const followers = await request(server)
            .get('/social/followers')
            .set('Authorization', `Bearer ${tokenB}`)
            .expect(200);
        expect(Array.isArray(followers.body)).toBe(true);

        const following = await request(server)
            .get('/social/following')
            .set('Authorization', `Bearer ${tokenA}`)
            .expect(200);
        expect(Array.isArray(following.body)).toBe(true);
    });
});
