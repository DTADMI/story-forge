import {Body, Controller, Get, Post} from '@nestjs/common';
import {ProjectsService, ProjectStub} from './projects.service';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly svc: ProjectsService) {
    }

    @Get()
    list(): ProjectStub[] {
        return this.svc.list();
    }

    @Post()
    create(@Body() body: { title: string; description?: string; defaultScope?: ProjectStub['defaultScope'] }) {
        // Minimal validation (no class-validator yet)
        if (!body?.title || typeof body.title !== 'string') {
            throw new Error('Invalid title');
        }
        return this.svc.create({
            title: body.title,
            description: body.description,
            defaultScope: body.defaultScope
        });
    }
}
