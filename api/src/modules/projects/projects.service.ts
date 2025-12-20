import {Injectable} from '@nestjs/common';

export type ProjectStub = {
    id: string;
    title: string;
    description?: string;
    defaultScope: 'private' | 'friends' | 'public-auth' | 'public-anyone';
};

@Injectable()
export class ProjectsService {
    private projects: ProjectStub[] = [
        {
            id: 'p1',
            title: 'Sample Project',
            description: 'A placeholder project to demonstrate the API scaffold',
            defaultScope: 'private'
        }
    ];

    list(): ProjectStub[] {
        return this.projects;
    }

    create(input: { title: string; description?: string; defaultScope?: ProjectStub['defaultScope'] }): ProjectStub {
        const id = `p${this.projects.length + 1}`;
        const project: ProjectStub = {
            id,
            title: input.title,
            description: input.description,
            defaultScope: input.defaultScope ?? 'private'
        };
        this.projects.push(project);
        return project;
    }
}
