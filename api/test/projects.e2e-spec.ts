import request from 'supertest';
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

    it('GET /projects should return 200 and an array', async () => {
        const server = app.getHttpServer();
        const res = await request(server).get('/projects').expect(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
