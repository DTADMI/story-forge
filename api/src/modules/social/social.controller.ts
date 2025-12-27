import {BadRequestException, Body, Controller, Get, Post, Query, UseGuards,} from '@nestjs/common';
import {SocialService} from './social.service';
import {ApiAuthGuard} from '../../common/auth/api-auth.guard';
import {CurrentUser} from '../../common/auth/current-user.decorator';
import {ReadRateLimitGuard, WriteRateLimitGuard,} from '../../common/guards/rate-limit.guard';

@Controller('social')
export class SocialController {
    constructor(private readonly svc: SocialService) {
    }

    @Post('follow')
    @UseGuards(ApiAuthGuard, WriteRateLimitGuard)
    async followToggle(
        @CurrentUser() user: { id: string } | undefined,
        @Body() body: { userId?: string }
    ) {
        if (!user?.id) throw new BadRequestException('unauthorized');
        const target = body?.userId;
        if (!target) throw new BadRequestException('userId required');
        return this.svc.toggleFollow(user.id, target);
    }

    @Get('followers')
    @UseGuards(ApiAuthGuard, ReadRateLimitGuard)
    async followers(
        @CurrentUser() user?: { id: string },
        @Query('userId') userId?: string,
        @Query('take') takeStr?: string,
        @Query('skip') skipStr?: string
    ) {
        const uid = userId || user?.id;
        if (!uid) throw new BadRequestException('userId required');
        const take = Math.min(50, Math.max(1, Number(takeStr ?? 20)));
        const skip = Math.max(0, Number(skipStr ?? 0));
        const rows = await this.svc.listFollowers(uid, take, skip);
        return rows.map((r) => ({
            id: r.id,
            user: {
                id: r.follower.id,
                name: r.follower.name,
                username: r.follower.username,
            },
        }));
    }

    @Get('following')
    @UseGuards(ApiAuthGuard, ReadRateLimitGuard)
    async following(
        @CurrentUser() user?: { id: string },
        @Query('userId') userId?: string,
        @Query('take') takeStr?: string,
        @Query('skip') skipStr?: string
    ) {
        const uid = userId || user?.id;
        if (!uid) throw new BadRequestException('userId required');
        const take = Math.min(50, Math.max(1, Number(takeStr ?? 20)));
        const skip = Math.max(0, Number(skipStr ?? 0));
        const rows = await this.svc.listFollowing(uid, take, skip);
        return rows.map((r) => ({
            id: r.id,
            user: {
                id: r.followee.id,
                name: r.followee.name,
                username: r.followee.username,
            },
        }));
    }

    @Post('cheer')
    @UseGuards(ApiAuthGuard, WriteRateLimitGuard)
    async cheer(
        @CurrentUser() user: { id: string } | undefined,
        @Body() body: { userId?: string }
    ) {
        if (!user?.id) throw new BadRequestException('unauthorized');
        const target = body?.userId;
        if (!target) throw new BadRequestException('userId required');
        try {
            return await this.svc.cheer(user.id, target);
        } catch (e: any) {
            throw new BadRequestException(e.message);
        }
    }
}
