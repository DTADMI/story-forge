import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../common/prisma/prisma.service';
import {VisibilityScope} from '@prisma/client';

export type DefaultScope = 'private' | 'friends' | 'public-auth' | 'public-anyone';

function toPrismaScope(scope: DefaultScope | undefined): VisibilityScope | undefined {
    switch (scope) {
        case 'private':
            return 'PRIVATE' as VisibilityScope;
        case 'friends':
            return 'FRIENDS' as VisibilityScope;
        case 'public-auth':
            return 'PUBLIC_AUTHENTICATED' as VisibilityScope;
        case 'public-anyone':
            return 'PUBLIC_ANYONE' as VisibilityScope;
        default:
            return undefined;
    }
}

function fromPrismaScope(scope: VisibilityScope): DefaultScope {
    switch (scope) {
        case 'PRIVATE':
            return 'private';
        case 'FRIENDS':
            return 'friends';
        case 'PUBLIC_AUTHENTICATED':
            return 'public-auth';
        case 'PUBLIC_ANYONE':
            return 'public-anyone';
    }
}

@Injectable()
export class ProjectsService {
    constructor(private readonly prisma: PrismaService) {
    }

    async listByUser(userId: string) {
        const rows = await this.prisma.project.findMany({
            where: {userId},
            orderBy: {updatedAt: 'desc'}
        });
        return rows.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description ?? undefined,
            defaultScope: fromPrismaScope(p.defaultScope)
        }));
    }

    async create(input: { userId: string; title: string; description?: string; defaultScope?: DefaultScope }) {
        const created = await this.prisma.project.create({
            data: {
                userId: input.userId,
                title: input.title,
                description: input.description,
                defaultScope: toPrismaScope(input.defaultScope) ?? 'PRIVATE'
            }
        });
        return {
            id: created.id,
            title: created.title,
            description: created.description ?? undefined,
            defaultScope: fromPrismaScope(created.defaultScope)
        } as const;
    }

    async findById(id: string) {
        const p = await this.prisma.project.findUnique({where: {id}});
        if (!p) return null;
        return {
            id: p.id,
            title: p.title,
            description: p.description ?? undefined,
            defaultScope: fromPrismaScope(p.defaultScope)
        } as const;
    }

    async update(id: string, data: { title?: string; description?: string; defaultScope?: DefaultScope }) {
        const updated = await this.prisma.project.update({
            where: {id},
            data: {
                title: data.title,
                description: data.description,
                defaultScope: toPrismaScope(data.defaultScope)
            }
        });
        return {
            id: updated.id,
            title: updated.title,
            description: updated.description ?? undefined,
            defaultScope: fromPrismaScope(updated.defaultScope)
        } as const;
    }
}
