import { Module } from '@nestjs/common';
import { PrismaService } from './common/prisma/prisma.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { DebugModule } from './modules/debug/debug.module';

@Module({
  imports: [UsersModule, AuthModule, HealthModule, DebugModule],
  providers: [PrismaService]
})
export class AppModule {}
