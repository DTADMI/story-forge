import request from 'supertest';
import * as jwt from 'jsonwebtoken';
import {Test} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {AppModule} from '../src/app.module';

describe('Projects (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.API_JWT_SECRET = 'testsecret123';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
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
    const token = jwt.sign({uid: 'test-user'}, secret, {
      algorithm: 'HS256',
      expiresIn: '5m',
    });
    const res = await request(server)
        .get('/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /projects/:id respects scopes', async () => {
    const server = app.getHttpServer();
    const secret = process.env.API_JWT_SECRET || 'testsecret123';
    const tokenA = jwt.sign({uid: 'user-a'}, secret, {
      algorithm: 'HS256',
      expiresIn: '5m',
    });
    const tokenB = jwt.sign({uid: 'user-b'}, secret, {
      algorithm: 'HS256',
      expiresIn: '5m',
    });

    // 1. Create a private project by A
    const p1 = await request(server)
        .post('/projects')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({title: 'Private A', defaultScope: 'private'})
        .expect(201);

    // 2. B tries to access it -> 403
    await request(server)
        .get(`/projects/${p1.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(403);

    // 3. Create a public project by A
    const p2 = await request(server)
        .post('/projects')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({title: 'Public A', defaultScope: 'public-anyone'})
        .expect(201);

    // 4. B tries to access it -> 200
    await request(server)
        .get(`/projects/${p2.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);
  });
});
