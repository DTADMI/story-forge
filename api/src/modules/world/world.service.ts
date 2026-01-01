import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../common/prisma/prisma.service';

@Injectable()
export class WorldService {
    constructor(private readonly prisma: PrismaService) {
    }

    // Characters
    async listCharacters(userId: string, projectId?: string) {
        return this.prisma.character.findMany({
            where: {userId, projectId: projectId || undefined},
            orderBy: {name: 'asc'},
        });
    }

    async createCharacter(userId: string, data: any) {
        return this.prisma.character.create({
            data: {...data, userId},
        });
    }

    async updateCharacter(id: string, userId: string, data: any) {
        return this.prisma.character.update({
            where: {id, userId},
            data,
        });
    }

    async deleteCharacter(id: string, userId: string) {
        return this.prisma.character.delete({
            where: {id, userId},
        });
    }

    // Locations
    async listLocations(userId: string, projectId?: string) {
        return this.prisma.location.findMany({
            where: {userId, projectId: projectId || undefined},
            orderBy: {name: 'asc'},
        });
    }

    async createLocation(userId: string, data: any) {
        return this.prisma.location.create({
            data: {...data, userId},
        });
    }

    async updateLocation(id: string, userId: string, data: any) {
        return this.prisma.location.update({
            where: {id, userId},
            data,
        });
    }

    async deleteLocation(id: string, userId: string) {
        return this.prisma.location.delete({
            where: {id, userId},
        });
    }

    // Timeline
    async listTimelineEvents(userId: string, projectId?: string) {
        return this.prisma.timelineEvent.findMany({
            where: {userId, projectId: projectId || undefined},
            orderBy: {date: 'asc'},
            include: {
                characters: true,
                locations: true,
            },
        });
    }

    async createTimelineEvent(userId: string, data: any) {
        const {characterIds, locationIds, ...rest} = data;
        return this.prisma.timelineEvent.create({
            data: {
                ...rest,
                userId,
                characters: characterIds ? {connect: characterIds.map((id: string) => ({id}))} : undefined,
                locations: locationIds ? {connect: locationIds.map((id: string) => ({id}))} : undefined,
            },
        });
    }
}
