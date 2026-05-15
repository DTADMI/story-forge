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

    // ── Characters ──

    @Get('characters')
    @UseGuards(ReadRateLimitGuard)
    async getCharacters(
        @CurrentUser() user: { id: string },
        @Query('projectId') projectId?: string,
    ) {
        return this.worldService.listCharacters(user.id, projectId);
    }

    @Get('characters/:id')
    @UseGuards(ReadRateLimitGuard)
    async getCharacter(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.worldService.getCharacter(id, user.id);
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

    // ── Locations ──

    @Get('locations')
    @UseGuards(ReadRateLimitGuard)
    async getLocations(
        @CurrentUser() user: { id: string },
        @Query('projectId') projectId?: string,
    ) {
        return this.worldService.listLocations(user.id, projectId);
    }

    @Get('locations/:id')
    @UseGuards(ReadRateLimitGuard)
    async getLocation(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.worldService.getLocation(id, user.id);
    }

    @Post('locations')
    @UseGuards(WriteRateLimitGuard)
    async createLocation(
        @CurrentUser() user: { id: string },
        @Body() body: any,
    ) {
        return this.worldService.createLocation(user.id, body);
    }

    @Patch('locations/:id')
    @UseGuards(WriteRateLimitGuard)
    async updateLocation(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
        @Body() body: any,
    ) {
        return this.worldService.updateLocation(id, user.id, body);
    }

    @Delete('locations/:id')
    @UseGuards(WriteRateLimitGuard)
    async deleteLocation(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.worldService.deleteLocation(id, user.id);
    }

    // ── Timeline ──

    @Get('timeline')
    @UseGuards(ReadRateLimitGuard)
    async getTimeline(
        @CurrentUser() user: { id: string },
        @Query('projectId') projectId?: string,
    ) {
        return this.worldService.listTimelineEvents(user.id, projectId);
    }

    @Get('timeline/:id')
    @UseGuards(ReadRateLimitGuard)
    async getTimelineEvent(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.worldService.getTimelineEvent(id, user.id);
    }

    @Post('timeline')
    @UseGuards(WriteRateLimitGuard)
    async createTimelineEvent(
        @CurrentUser() user: { id: string },
        @Body() body: any,
    ) {
        return this.worldService.createTimelineEvent(user.id, body);
    }

    @Patch('timeline/:id')
    @UseGuards(WriteRateLimitGuard)
    async updateTimelineEvent(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
        @Body() body: any,
    ) {
        return this.worldService.updateTimelineEvent(id, user.id, body);
    }

    @Delete('timeline/:id')
    @UseGuards(WriteRateLimitGuard)
    async deleteTimelineEvent(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.worldService.deleteTimelineEvent(id, user.id);
    }

    // ── Dialogues ──

    @Get('dialogues')
    @UseGuards(ReadRateLimitGuard)
    async getDialogues(
        @CurrentUser() user: { id: string },
        @Query('projectId') projectId?: string,
    ) {
        return this.worldService.listDialogues(user.id, projectId);
    }

    @Get('dialogues/:id')
    @UseGuards(ReadRateLimitGuard)
    async getDialogue(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.worldService.getDialogue(id, user.id);
    }

    @Post('dialogues')
    @UseGuards(WriteRateLimitGuard)
    async createDialogue(
        @CurrentUser() user: { id: string },
        @Body() body: any,
    ) {
        return this.worldService.createDialogue(user.id, body);
    }

    @Patch('dialogues/:id')
    @UseGuards(WriteRateLimitGuard)
    async updateDialogue(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
        @Body() body: any,
    ) {
        return this.worldService.updateDialogue(id, user.id, body);
    }

    @Delete('dialogues/:id')
    @UseGuards(WriteRateLimitGuard)
    async deleteDialogue(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.worldService.deleteDialogue(id, user.id);
    }
}
