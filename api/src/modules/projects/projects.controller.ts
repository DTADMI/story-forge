import {BadRequestException, Body, Controller, Get, Param, Patch, Post, Query} from '@nestjs/common';
import {DefaultScope, ProjectsService} from './projects.service';

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
    async list(@Query('userId') userId?: string) {
        if (!userId) throw new BadRequestException('userId is required');
        return this.svc.listByUser(userId);
    }

    @Post()
    async create(@Body() body: CreateProjectDto) {
        if (!body?.userId) throw new BadRequestException('userId is required');
        if (!body?.title || typeof body.title !== 'string') throw new BadRequestException('title is required');
        return this.svc.create({
            userId: body.userId,
            title: body.title,
            description: body.description,
            defaultScope: body.defaultScope
        });
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        return this.svc.findById(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: UpdateProjectDto) {
        return this.svc.update(id, body);
    }
}
