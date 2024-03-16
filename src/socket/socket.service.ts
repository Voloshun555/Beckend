import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class SocketService {
    constructor(private readonly prisma: PrismaService) { }

    async markUserOnline(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { isOnline: true },
        });
    }
    async markUserOffline(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { isOnline: false },
        });
    }

    async getAllOnlineUsers(): Promise<string[]> {
        const onlineUsers = await this.prisma.user.findMany({
            where: { isOnline: true },
            select: { id: true },
        });
        return onlineUsers.map(user => user.id);
    }
}