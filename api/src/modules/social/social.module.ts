import {Module} from '@nestjs/common';
import {SocialService} from './social.service';
import {SocialController} from './social.controller';
import {PrismaService} from '../../common/prisma/prisma.service';
import {GroupsService} from './groups/groups.service';
import {GroupsController} from './groups/groups.controller';

@Module({
    controllers: [SocialController, GroupsController],
    providers: [SocialService, PrismaService, GroupsService],
    exports: [SocialService, GroupsService],
})
export class SocialModule {
}
