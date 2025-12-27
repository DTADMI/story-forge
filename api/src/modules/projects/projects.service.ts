import {ForbiddenException, Injectable} from '@nestjs/common';
import {PrismaService} from '../../common/prisma/prisma.service';
import {VisibilityScope} from '@prisma/client';
import {SocialService} from '../social/social.service';

export type DefaultScope =
    | 'private'
    | 'friends'
    | 'public-auth'
    | 'public-anyone';

function toPrismaScope(
    scope: DefaultScope | undefined
): VisibilityScope | undefined {
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
    constructor(
        private readonly prisma: PrismaService,
        private readonly social: SocialService
    ) {
    }

    async listByUser(userId: string, viewerId?: string) {
        const isOwner = userId === viewerId;
        const isFriend =
            viewerId && !isOwner ? await this.social.isFriend(userId, viewerId) : false;

        const allowedScopes: VisibilityScope[] = ['PUBLIC_ANYONE'];
        if (viewerId) allowedScopes.push('PUBLIC_AUTHENTICATED');
        if (isFriend) allowedScopes.push('FRIENDS');

        const rows = await this.prisma.project.findMany({
            where: {
                userId,
                OR: isOwner ? undefined : [{defaultScope: {in: allowedScopes}}],
            },
            orderBy: {updatedAt: 'desc'},
        });
        return rows.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description ?? undefined,
            defaultScope: fromPrismaScope(p.defaultScope),
        }));
    }

    async create(input: {
        userId: string;
        title: string;
        description?: string;
        defaultScope?: DefaultScope;
    }) {
        const created = await this.prisma.project.create({
            data: {
                userId: input.userId,
                title: input.title,
                description: input.description,
                defaultScope: toPrismaScope(input.defaultScope) ?? 'PRIVATE',
            },
        });
        return {
            id: created.id,
            title: created.title,
            description: created.description ?? undefined,
            defaultScope: fromPrismaScope(created.defaultScope),
        } as const;
    }

    async findById(id: string, viewerId?: string) {
        const p = await this.prisma.project.findUnique({where: {id}});
        if (!p) return null;

        const isOwner = p.userId === viewerId;
        if (!isOwner) {
            const isFriend =
                viewerId && !isOwner
                    ? await this.social.isFriend(p.userId, viewerId)
                    : false;
            const scope = p.defaultScope;

            let allowed = false;
            if (scope === 'PUBLIC_ANYONE') allowed = true;
            if (scope === 'PUBLIC_AUTHENTICATED' && viewerId) allowed = true;
            if (scope === 'FRIENDS' && isFriend) allowed = true;

            if (!allowed) throw new ForbiddenException('Access denied');
        }

        return {
            id: p.id,
            userId: p.userId,
            title: p.title,
            description: p.description ?? undefined,
            defaultScope: fromPrismaScope(p.defaultScope),
        } as const;
    }

    async update(
        id: string,
        viewerId: string,
        data: { title?: string; description?: string; defaultScope?: DefaultScope }
    ) {
        const p = await this.prisma.project.findUnique({where: {id}});
        if (!p) return null;
        if (p.userId !== viewerId) throw new ForbiddenException('Not the owner');

        const updated = await this.prisma.project.update({
            where: {id},
            data: {
                title: data.title,
                description: data.description,
                defaultScope: toPrismaScope(data.defaultScope),
            },
        });
        return {
            id: updated.id,
            title: updated.title,
            description: updated.description ?? undefined,
            defaultScope: fromPrismaScope(updated.defaultScope),
        } as const;
    }
}
