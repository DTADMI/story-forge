import {BadRequestException, Body, Controller, Get, Post, UseGuards,} from '@nestjs/common';
import {GamificationService} from './gamification.service';
import {ApiAuthGuard} from '../../common/auth/api-auth.guard';
import {CurrentUser} from '../../common/auth/current-user.decorator';
import {ReadRateLimitGuard, WriteRateLimitGuard,} from '../../common/guards/rate-limit.guard';

@Controller('gamification')
export class GamificationController {
    constructor(private readonly svc: GamificationService) {
    }

    @Get('wallet')
    @UseGuards(ApiAuthGuard, ReadRateLimitGuard)
    async wallet(@CurrentUser() user?: { id: string }) {
        if (!user?.id) throw new BadRequestException('userId is required');
        const wallet = await this.svc.getOrCreateWallet(user.id);
        return {userId: user.id, balance: wallet.balance};
    }

    @Post('progress')
    @UseGuards(ApiAuthGuard, WriteRateLimitGuard)
    async progress(
        @CurrentUser() user: { id: string } | undefined,
        @Body() body: { value?: number; goalId?: string }
    ) {
        if (!user?.id) throw new BadRequestException('userId is required');
        const value = Number(body.value ?? 0);
        if (!Number.isFinite(value) || value <= 0)
            throw new BadRequestException('value must be a positive number');
        return this.svc.logProgress(user.id, value, body.goalId);
    }

  @Post('goals')
  @UseGuards(ApiAuthGuard, WriteRateLimitGuard)
  async setGoal(
      @CurrentUser() user: { id: string } | undefined,
      @Body() body: { target?: number }
  ) {
    if (!user?.id) throw new BadRequestException('userId is required');
    const target = Number(body?.target ?? 0);
      if (!Number.isFinite(target) || target <= 0)
          throw new BadRequestException('target must be a positive number');
    const goal = await this.svc.upsertDailyGoal(user.id, target);
      return {
          id: goal.id,
          target: goal.target,
          cadence: goal.cadence,
          type: goal.type,
      };
  }

  @Get('streak')
  @UseGuards(ApiAuthGuard, ReadRateLimitGuard)
  async getStreak(@CurrentUser() user?: { id: string }) {
    if (!user?.id) throw new BadRequestException('userId is required');
    return this.svc.getDailyStreak(user.id);
  }
}
