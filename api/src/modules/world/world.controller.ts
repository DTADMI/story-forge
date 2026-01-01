import {Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards} from '@nestjs/common';
import {WorldService} from './world.service';
import {ApiAuthGuard} from '../../common/auth/api-auth.guard';
import {CurrentUser} from '../../common/auth/current-user.decorator';
import {ReadRateLimitGuard, WriteRateLimitGuard} from '../../common/guards/rate-limit.guard';

@Controller('world')
@UseGuards(ApiAuthGuard)
export class WorldController {
    constructor(private readonly worldService: WorldService) {
    }

    @Get('characters')
    @UseGuards(ReadRateLimitGuard)
    async getCharacters(
        @CurrentUser() user: { id: string },
        @Query('projectId') projectId?: string,
    ) {
        return this.worldService.listCharacters(user.id, projectId);
    }

    @Post('characters')
    @UseGuards(WriteRateLimitGuard)
    async createCharacter(
        @CurrentUser() user: { id: string },
        @Body() body: any,
    ) {
        return this.worldService.createCharacter(user.id, body);
    }

    @Patch('characters/:id')
    @UseGuards(WriteRateLimitGuard)
    async updateCharacter(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
        @Body() body: any,
    ) {
        return this.worldService.updateCharacter(id, user.id, body);
    }

    @Delete('characters/:id')
    @UseGuards(WriteRateLimitGuard)
    async deleteCharacter(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.worldService.deleteCharacter(id, user.id);
    }

    @Get('locations')
    @UseGuards(ReadRateLimitGuard)
    async getLocations(
        @CurrentUser() user: { id: string },
        @Query('projectId') projectId?: string,
    ) {
        return this.worldService.listLocations(user.id, projectId);
    }

    @Post('locations')
    @UseGuards(WriteRateLimitGuard)
    async createLocation(
        @CurrentUser() user: { id: string },
        @Body() body: any,
    ) {
        return this.worldService.createLocation(user.id, body);
    }

    @Get('timeline')
    @UseGuards(ReadRateLimitGuard)
    async getTimeline(
        @CurrentUser() user: { id: string },
        @Query('projectId') projectId?: string,
    ) {
        return this.worldService.listTimelineEvents(user.id, projectId);
    }

    @Post('timeline')
    @UseGuards(WriteRateLimitGuard)
    async createTimelineEvent(
        @CurrentUser() user: { id: string },
        @Body() body: any,
    ) {
        return this.worldService.createTimelineEvent(user.id, body);
    }
}
