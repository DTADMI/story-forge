import {BadRequestException, Body, Controller, Get, Param, Patch, UseGuards,} from '@nestjs/common';
import {UsersService} from './users.service';
import {ApiAuthGuard} from '../../common/auth/api-auth.guard';
import {CurrentUser} from '../../common/auth/current-user.decorator';
import {ReadRateLimitGuard, WriteRateLimitGuard,} from '../../common/guards/rate-limit.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @UseGuards(ApiAuthGuard, ReadRateLimitGuard)
  async getById(@Param('id') id: string, @CurrentUser() user?: { id: string }) {
      const target = await this.usersService.findById(id);
      if (!target) throw new BadRequestException('User not found');

      const {passwordHash, ...rest} = target as any;

      // If it's the user themselves, return everything
      if (user?.id === id) {
          return rest;
      }

      // Otherwise, return a public-safe subset
      return {
          id: rest.id,
          name: rest.name,
          username: rest.username,
          bio: rest.bio,
          website: rest.website,
          subscriptionStatus: rest.subscriptionStatus,
          createdAt: rest.createdAt,
      };
  }

    @Patch(':id')
    @UseGuards(ApiAuthGuard, WriteRateLimitGuard)
    async update(
        @Param('id') id: string,
        @CurrentUser() user: { id: string } | undefined,
        @Body()
        body: {
            name?: string | null;
            username?: string | null;
            bio?: string | null;
            website?: string | null;
            defaultPublicationScope?:
                | 'private'
                | 'friends'
                | 'public-auth'
                | 'public-anyone';
        }
    ) {
        if (!user?.id || user.id !== id) throw new BadRequestException('forbidden');
        if (!id) throw new BadRequestException('id is required');
        if (body && typeof body !== 'object')
            throw new BadRequestException('invalid body');
        if (body?.username && typeof body.username !== 'string')
            throw new BadRequestException('username must be string');
        if (body?.name && typeof body.name !== 'string')
            throw new BadRequestException('name must be string');
        if (body?.bio && typeof body.bio !== 'string')
            throw new BadRequestException('bio must be string');
        if (body?.website && typeof body.website !== 'string')
            throw new BadRequestException('website must be string');
        if (body?.defaultPublicationScope) {
            const allowed = ['private', 'friends', 'public-auth', 'public-anyone'];
            if (!allowed.includes(body.defaultPublicationScope)) {
                throw new BadRequestException('invalid defaultPublicationScope');
            }
        }
        const settings = body?.defaultPublicationScope
            ? {defaultPublicationScope: body.defaultPublicationScope}
            : undefined;
        const updated = await this.usersService.updateById(id, {
            name: body.name,
            username: body.username,
            bio: body.bio,
            website: body.website,
            settings,
        });
        const {passwordHash, ...rest} = updated as any;
        return rest;
    }

    @Patch(':id/preferences')
    @UseGuards(ApiAuthGuard, WriteRateLimitGuard)
    async updatePreferences(
        @Param('id') id: string,
        @CurrentUser() user: { id: string } | undefined,
        @Body()
        body: {
            quietHours?: { start?: string; end?: string };
            cadence?: 'immediate' | 'daily' | 'weekly';
            channels?: { email?: boolean; sms?: boolean; push?: boolean };
        }
    ) {
        if (!user?.id || user.id !== id) throw new BadRequestException('forbidden');
        if (body && typeof body !== 'object')
            throw new BadRequestException('invalid body');
        // Basic validation
        const settings: Record<string, any> = {preferences: {}};
        if (body.quietHours) settings.preferences.quietHours = body.quietHours;
        if (body.cadence) settings.preferences.cadence = body.cadence;
        if (body.channels) settings.preferences.channels = body.channels;
        const updated = await this.usersService.updateById(id, {settings});
        const {passwordHash, ...rest} = updated as any;
        return rest;
    }
}
