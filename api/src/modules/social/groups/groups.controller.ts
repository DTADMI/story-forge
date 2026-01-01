import {Body, Controller, Delete, Get, Param, Post, UseGuards} from '@nestjs/common';
import {GroupsService} from './groups.service';
import {ApiAuthGuard} from '../../../common/auth/api-auth.guard';
import {CurrentUser} from '../../../common/auth/current-user.decorator';
import {ReadRateLimitGuard, WriteRateLimitGuard} from '../../../common/guards/rate-limit.guard';

@Controller('social/groups')
@UseGuards(ApiAuthGuard)
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {
    }

    @Get()
    @UseGuards(ReadRateLimitGuard)
    async getGroups(@CurrentUser() user: { id: string }) {
        return this.groupsService.listGroups(user.id);
    }

    @Post()
    @UseGuards(WriteRateLimitGuard)
    async createGroup(
        @CurrentUser() user: { id: string },
        @Body() body: { name: string; description?: string; isPrivate?: boolean },
    ) {
        return this.groupsService.createGroup(user.id, body);
    }

    @Post(':id/join')
    @UseGuards(WriteRateLimitGuard)
    async joinGroup(
        @CurrentUser() user: { id: string },
        @Param('id') id: string,
    ) {
        return this.groupsService.joinGroup(user.id, id);
    }

    @Delete(':id/leave')
    @UseGuards(WriteRateLimitGuard)
    async leaveGroup(
        @CurrentUser() user: { id: string },
        @Param('id') id: string,
    ) {
        return this.groupsService.leaveGroup(user.id, id);
    }
}
