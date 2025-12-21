import {BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, UseGuards} from '@nestjs/common';
import {DefaultScope, ProjectsService} from './projects.service';
import {ApiAuthGuard} from '../../common/auth/api-auth.guard';
import {CurrentUser} from '../../common/auth/current-user.decorator';
import {ReadRateLimitGuard, WriteRateLimitGuard} from '../../common/guards/rate-limit.guard';

class CreateProjectDto {
    userId!: string;
    title!: string;
    description?: string;
    defaultScope?: DefaultScope;
}

class UpdateProjectDto {
    title?: string;
    description?: string;
    defaultScope?: DefaultScope;
}

@Controller('projects')
export class ProjectsController {
    constructor(private readonly svc: ProjectsService) {
    }

    @Get()
    @UseGuards(ApiAuthGuard, ReadRateLimitGuard)
    async list(@CurrentUser() user?: { id: string }, @Query('userId') userId?: string) {
        const uid = user?.id || userId;
        if (!uid) throw new BadRequestException('userId is required');
        return this.svc.listByUser(uid);
    }

    @Post()
    @UseGuards(ApiAuthGuard, WriteRateLimitGuard)
    async create(@CurrentUser() user: { id: string } | undefined, @Body() body: CreateProjectDto) {
        const uid = user?.id || body?.userId;
        if (!uid) throw new BadRequestException('userId is required');
        if (!body?.title || typeof body.title !== 'string') throw new BadRequestException('title is required');
        return this.svc.create({
            userId: uid,
            title: body.title,
            description: body.description,
            defaultScope: body.defaultScope
        });
    }

    @Get(':id')
    @UseGuards(ApiAuthGuard, ReadRateLimitGuard)
    async getById(@Param('id') id: string) {
        return this.svc.findById(id);
    }

    @Patch(':id')
    @UseGuards(ApiAuthGuard, WriteRateLimitGuard)
    async update(@Param('id') id: string, @Body() body: UpdateProjectDto) {
        return this.svc.update(id, body);
    }
}
