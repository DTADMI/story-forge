import {BadRequestException, Body, Controller, Get, Param, Patch} from '@nestjs/common';
import {UsersService} from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: {
        name?: string | null;
        username?: string | null;
        bio?: string | null;
        website?: string | null;
        defaultPublicationScope?: 'private' | 'friends' | 'public-auth' | 'public-anyone'
    }) {
        if (!id) throw new BadRequestException('id is required');
        if (body && typeof body !== 'object') throw new BadRequestException('invalid body');
        if (body?.username && typeof body.username !== 'string') throw new BadRequestException('username must be string');
        if (body?.name && typeof body.name !== 'string') throw new BadRequestException('name must be string');
        if (body?.bio && typeof body.bio !== 'string') throw new BadRequestException('bio must be string');
        if (body?.website && typeof body.website !== 'string') throw new BadRequestException('website must be string');
        if (body?.defaultPublicationScope) {
            const allowed = ['private', 'friends', 'public-auth', 'public-anyone'];
            if (!allowed.includes(body.defaultPublicationScope)) {
                throw new BadRequestException('invalid defaultPublicationScope');
            }
        }
        const settings = body?.defaultPublicationScope ? {defaultPublicationScope: body.defaultPublicationScope} : undefined;
        const updated = await this.usersService.updateById(id, {
            name: body.name,
            username: body.username,
            bio: body.bio,
            website: body.website,
            settings
        });
        const {passwordHash, ...rest} = updated as any;
        return rest;
    }
}
