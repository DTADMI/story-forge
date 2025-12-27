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

    async cheer(senderId: string, receiverId: string) {
        if (senderId === receiverId) throw new Error('Cannot cheer yourself');

        const senderPot = await this.prisma.inkPot.findUnique({where: {userId: senderId}});
        if (!senderPot || senderPot.balance < 1) {
            throw new Error('Not enough Ink');
        }

        return this.prisma.$transaction(async (tx) => {
            // Deduct 1 from sender
            await tx.inkPot.update({
                where: {userId: senderId},
                data: {balance: {decrement: 1}},
            });
            await tx.inkTx.create({
                data: {userId: senderId, amount: -1, reason: 'sent_cheer', metadata: {to: receiverId}},
            });

            // Add 1 to receiver
            await tx.inkPot.upsert({
                where: {userId: receiverId},
                update: {balance: {increment: 1}},
                create: {userId: receiverId, balance: 1},
            });
            await tx.inkTx.create({
                data: {userId: receiverId, amount: 1, reason: 'received_cheer', metadata: {from: senderId}},
            });

            return {success: true};
        });
    }
}
