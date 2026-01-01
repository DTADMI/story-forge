import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../common/prisma/prisma.service';

@Injectable()
export class GroupsService {
    constructor(private readonly prisma: PrismaService) {
    }

    async listGroups(userId: string) {
        return this.prisma.group.findMany({
            where: {
                OR: [
                    {isPrivate: false},
                    {members: {some: {userId}}}
                ]
            },
            include: {
                _count: {select: {members: true}}
            }
        });
    }

    async createGroup(userId: string, data: { name: string; description?: string; isPrivate?: boolean }) {
        return this.prisma.$transaction(async (tx) => {
            const group = await tx.group.create({
                data: {
                    name: data.name,
                    description: data.description,
                    isPrivate: data.isPrivate ?? false,
                }
            });
            await tx.groupMember.create({
                data: {
                    groupId: group.id,
                    userId,
                    role: 'admin'
                }
            });
            return group;
        });
    }

    async joinGroup(userId: string, groupId: string) {
        return this.prisma.groupMember.create({
            data: {
                groupId,
                userId,
                role: 'member'
            }
        });
    }

    async leaveGroup(userId: string, groupId: string) {
        return this.prisma.groupMember.delete({
            where: {
                groupId_userId: {groupId, userId}
            }
        });
    }
}
