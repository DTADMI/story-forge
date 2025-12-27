import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../common/prisma/prisma.service';

@Injectable()
export class GamificationService {
    constructor(private readonly prisma: PrismaService) {
    }

    async getOrCreateWallet(userId: string) {
        let pot = await this.prisma.inkPot.findUnique({where: {userId}});
        if (!pot) {
            pot = await this.prisma.inkPot.create({
                data: {userId, balance: 0},
            });
        }
        return pot;
    }

    async getWallet(userId: string) {
        return this.prisma.inkPot.findUnique({where: {userId}});
    }

    async logProgress(userId: string, value: number, goalId?: string) {
        // Minimal stub: record progress and optionally reward small ink
        const tx = await this.prisma.progressLog.create({
            data: {userId, value, goalId: goalId ?? null},
        });
        // Reward 1 ink per 500 units value (very rough placeholder)
        const reward = Math.floor(value / 500);
        if (reward > 0) {
            await this.prisma.inkTx.create({
                data: {userId, amount: reward, reason: 'progress_reward'},
            });
            await this.prisma.inkPot.upsert({
                where: {userId},
                update: {balance: {increment: reward}},
                create: {userId, balance: reward},
            });
        }
        return {logged: true, reward} as const;
    }

    async upsertDailyGoal(userId: string, target: number) {
        const existing = await this.prisma.goal.findFirst({
            where: {userId, type: 'words_per_day', cadence: 'daily'},
        });
        if (existing) {
            return this.prisma.goal.update({
                where: {id: existing.id},
                data: {target},
            });
        }
        return this.prisma.goal.create({
            data: {userId, type: 'words_per_day', cadence: 'daily', target},
        });
    }

    async getDailyStreak(userId: string) {
        // Find the current daily goal
        const goal = await this.prisma.goal.findFirst({
            where: {userId, type: 'words_per_day', cadence: 'daily'},
        });
        const target = goal?.target ?? 0;
        if (!target) return {streak: 0};

        // Aggregate progress by day (UTC) from latest 60 days for a simple streak calc
        const since = new Date();
        since.setUTCDate(since.getUTCDate() - 60);
        const logs = await this.prisma.progressLog.findMany({
            where: {userId, timestamp: {gte: since}},
            orderBy: {timestamp: 'desc'},
        });

        // Sum values per day key YYYY-MM-DD
        const perDay = new Map<string, number>();
        for (const l of logs) {
            const d = new Date(l.timestamp);
            const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
            perDay.set(key, (perDay.get(key) ?? 0) + l.value);
        }

        // Walk back from today counting consecutive days meeting target
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 60; i++) {
            const d = new Date(
                Date.UTC(
                    today.getUTCFullYear(),
                    today.getUTCMonth(),
                    today.getUTCDate()
                )
            );
            d.setUTCDate(d.getUTCDate() - i);
            const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
            const sum = perDay.get(key) ?? 0;
            if (sum >= target) streak++;
            else break;
        }
        return {streak};
    }
}
