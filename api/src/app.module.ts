import {Module} from '@nestjs/common';
import {PrismaModule} from './common/prisma/prisma.module';
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
        PrismaModule,
        UsersModule,
        AuthModule,
        HealthModule,
        DebugModule,
        BillingModule,
        ProjectsModule,
        GamificationModule,
        SocialModule,
    ],
})
export class AppModule {}
