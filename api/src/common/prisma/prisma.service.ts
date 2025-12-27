import {INestApplication, Injectable, OnModuleInit} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
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
