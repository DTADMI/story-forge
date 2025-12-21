import {Module} from '@nestjs/common';
import {SocialService} from './social.service';
import {SocialController} from './social.controller';
import {PrismaService} from '../../common/prisma/prisma.service';

@Module({
    controllers: [SocialController],
    providers: [SocialService, PrismaService]
})
export class SocialModule {
}
