import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

    async updateById(
        id: string,
        data: {
            name?: string | null;
            username?: string | null;
            bio?: string | null;
            website?: string | null;
            settings?: Record<string, any> | null;
        }
    ) {
        return this.prisma.user.update({
            where: {id},
            data: {
                name: data.name ?? undefined,
                username: data.username ?? undefined,
                bio: data.bio ?? undefined,
                website: data.website ?? undefined,
                settings: data.settings ?? undefined,
            },
        });
    }
}
