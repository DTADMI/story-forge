import {BadRequestException, Body, Controller, Get, Post, Query} from '@nestjs/common';
import {GamificationService} from './gamification.service';

@Controller('gamification')
export class GamificationController {
    constructor(private readonly svc: GamificationService) {
    }

    @Get('wallet')
    async wallet(@Query('userId') userId?: string) {
        if (!userId) throw new BadRequestException('userId is required');
        const wallet = await this.svc.getOrCreateWallet(userId);
        return {userId, balance: wallet.balance};
    }

    @Post('progress')
    async progress(@Body() body: { userId?: string; value?: number; goalId?: string }) {
        if (!body?.userId) throw new BadRequestException('userId is required');
        const value = Number(body.value ?? 0);
        if (!Number.isFinite(value) || value <= 0) throw new BadRequestException('value must be a positive number');
        return this.svc.logProgress(body.userId, value, body.goalId);
    }

  @Post('goals')
  async setGoal(@Body() body: { userId?: string; target?: number }) {
    if (!body?.userId) throw new BadRequestException('userId is required');
    const target = Number(body?.target ?? 0);
    if (!Number.isFinite(target) || target <= 0) throw new BadRequestException('target must be a positive number');
    const goal = await this.svc.upsertDailyGoal(body.userId, target);
    return {id: goal.id, target: goal.target, cadence: goal.cadence, type: goal.type};
  }

  @Get('streak')
  async getStreak(@Query('userId') userId?: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.svc.getDailyStreak(userId);
  }
}
