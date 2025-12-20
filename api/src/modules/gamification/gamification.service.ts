import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../common/prisma/prisma.service';

@Injectable()
export class GamificationService {
    constructor(private readonly prisma: PrismaService) {
    }

    async getOrCreateWallet(userId: string) {
        let wallet = await this.prisma.gemWallet.findUnique({where: {userId}});
        if (!wallet) {
            wallet = await this.prisma.gemWallet.create({data: {userId, balance: 0}});
        }
        return wallet;
    }

    async getWallet(userId: string) {
        return this.prisma.gemWallet.findUnique({where: {userId}});
    }

    async logProgress(userId: string, value: number, goalId?: string) {
        // Minimal stub: record progress and optionally reward small gems
        const tx = await this.prisma.progressLog.create({
            data: {userId, value, goalId: goalId ?? null}
        });
        // Reward 1 gem per 500 units value (very rough placeholder)
        const reward = Math.floor(value / 500);
        if (reward > 0) {
            await this.prisma.gemTx.create({data: {userId, amount: reward, reason: 'progress_reward'}});
            await this.prisma.gemWallet.upsert({
                where: {userId},
                update: {balance: {increment: reward}},
                create: {userId, balance: reward}
            });
        }
        return {logged: true, reward} as const;
    }
}
