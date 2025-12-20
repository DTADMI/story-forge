import {Module} from '@nestjs/common';
import {PrismaService} from './common/prisma/prisma.service';
import {UsersModule} from './modules/users/users.module';
import {AuthModule} from './modules/auth/auth.module';
import {HealthModule} from './modules/health/health.module';
import {DebugModule} from './modules/debug/debug.module';
import {BillingModule} from './modules/billing/billing.module';
import {ProjectsModule} from './modules/projects/projects.module';

@Module({
    imports: [UsersModule, AuthModule, HealthModule, DebugModule, BillingModule, ProjectsModule],
  providers: [PrismaService]
})
export class AppModule {}
