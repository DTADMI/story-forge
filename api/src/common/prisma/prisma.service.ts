import {INestApplication, Injectable, OnModuleInit} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {Pool} from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        const pool = new Pool({connectionString: process.env.DATABASE_URL});
        const adapter = new PrismaPg(pool);
        super({adapter});
    }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
      // Note: $on('beforeExit') is removed in newer Prisma versions or needs explicit type casting
      (this as any).$on('beforeExit', async () => {
      await app.close();
    });
  }
}
