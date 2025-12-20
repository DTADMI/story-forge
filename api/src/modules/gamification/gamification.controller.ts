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
}
