import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../../common/prisma/prisma.service';

@Injectable()
export class WorldService {
    constructor(private readonly prisma: PrismaService) {
    }

    // ── Characters ──

    async listCharacters(userId: string, projectId?: string) {
        return this.prisma.character.findMany({
            where: {userId, projectId: projectId || undefined},
            orderBy: {name: 'asc'},
        });
    }

    async getCharacter(id: string, userId: string) {
        const character = await this.prisma.character.findFirst({
            where: {id, userId},
            include: {project: true},
        });
        if (!character) throw new NotFoundException('Character not found');
        return character;
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

    // ── Locations ──

    async listLocations(userId: string, projectId?: string) {
        return this.prisma.location.findMany({
            where: {userId, projectId: projectId || undefined},
            orderBy: {name: 'asc'},
        });
    }

    async getLocation(id: string, userId: string) {
        const location = await this.prisma.location.findFirst({
            where: {id, userId},
            include: {project: true},
        });
        if (!location) throw new NotFoundException('Location not found');
        return location;
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

    // ── Timeline ──

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

    async getTimelineEvent(id: string, userId: string) {
        const event = await this.prisma.timelineEvent.findFirst({
            where: {id, userId},
            include: {
                characters: true,
                locations: true,
                project: true,
            },
        });
        if (!event) throw new NotFoundException('Timeline event not found');
        return event;
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

    async updateTimelineEvent(id: string, userId: string, data: any) {
        const {characterIds, locationIds, ...rest} = data;
        return this.prisma.timelineEvent.update({
            where: {id, userId},
            data: {
                ...rest,
                characters: characterIds !== undefined
                    ? {set: characterIds.map((cid: string) => ({id: cid}))}
                    : undefined,
                locations: locationIds !== undefined
                    ? {set: locationIds.map((lid: string) => ({id: lid}))}
                    : undefined,
            },
            include: {characters: true, locations: true},
        });
    }

    async deleteTimelineEvent(id: string, userId: string) {
        return this.prisma.timelineEvent.delete({
            where: {id, userId},
        });
    }

    // ── Dialogues ──

    async listDialogues(userId: string, projectId?: string) {
        return this.prisma.dialogue.findMany({
            where: {userId, projectId: projectId || undefined},
            orderBy: {createdAt: 'desc'},
            include: {project: true},
        });
    }

    async getDialogue(id: string, userId: string) {
        const dialogue = await this.prisma.dialogue.findFirst({
            where: {id, userId},
            include: {project: true, timelineEvents: true},
        });
        if (!dialogue) throw new NotFoundException('Dialogue not found');
        return dialogue;
    }

    async createDialogue(userId: string, data: any) {
        return this.prisma.dialogue.create({
            data: {...data, userId},
        });
    }

    async updateDialogue(id: string, userId: string, data: any) {
        return this.prisma.dialogue.update({
            where: {id, userId},
            data,
        });
    }

    async deleteDialogue(id: string, userId: string) {
        return this.prisma.dialogue.delete({
            where: {id, userId},
        });
    }
}
