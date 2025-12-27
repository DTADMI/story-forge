import {Module} from '@nestjs/common';
import {PrismaService} from './common/prisma/prisma.service';
import {UsersModule} from './modules/users/users.module';
import {AuthModule} from './modules/auth/auth.module';
import {HealthModule} from './modules/health/health.module';
import {DebugModule} from './modules/debug/debug.module';
import {BillingModule} from './modules/billing/billing.module';
import {ProjectsModule} from './modules/projects/projects.module';
import {GamificationModule} from './modules/gamification/gamification.module';
import {SocialModule} from './modules/social/social.module';
import {assertEnv} from './config/env';

assertEnv();

@Module({
    imports: [
        UsersModule,
        AuthModule,
        HealthModule,
        DebugModule,
        BillingModule,
        ProjectsModule,
        GamificationModule,
        SocialModule,
    ],
    providers: [PrismaService],
})
export class AppModule {}
