import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../common/prisma/prisma.service';

@Injectable()
export class SocialService {
    constructor(private readonly prisma: PrismaService) {
    }

    async toggleFollow(currentUserId: string, targetUserId: string) {
        if (currentUserId === targetUserId) return {following: false} as const;
        const existing = await this.prisma.follow.findUnique({
            where: {
                followerId_followeeId: {
                    followerId: currentUserId,
                    followeeId: targetUserId,
                },
            },
        });
        if (existing) {
            await this.prisma.follow.delete({where: {id: existing.id}});
            return {following: false} as const;
        }
        await this.prisma.follow.create({
            data: {followerId: currentUserId, followeeId: targetUserId},
        });
        return {following: true} as const;
    }

    listFollowers(userId: string, take = 20, skip = 0) {
        return this.prisma.follow.findMany({
            where: {followeeId: userId},
            take,
            skip,
            orderBy: {createdAt: 'desc'},
            include: {follower: true},
        });
    }

    listFollowing(userId: string, take = 20, skip = 0) {
        return this.prisma.follow.findMany({
            where: {followerId: userId},
            take,
            skip,
            orderBy: {createdAt: 'desc'},
            include: {followee: true},
        });
    }

    async isFriend(userA: string, userB: string): Promise<boolean> {
        if (userA === userB) return true;
        const [aFollowsB, bFollowsA] = await Promise.all([
            this.prisma.follow.findUnique({
                where: {
                    followerId_followeeId: {followerId: userA, followeeId: userB},
                },
            }),
            this.prisma.follow.findUnique({
                where: {
                    followerId_followeeId: {followerId: userB, followeeId: userA},
                },
            }),
        ]);
        return !!(aFollowsB && bFollowsA);
    }
}
