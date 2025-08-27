import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HandleErrorsService } from 'src/common/handleErrors.service';
import { FindEntityByIdService } from 'src/common/FindEntityById.service';
import { SocketService } from 'src/common/socket.service';
import { SocketGateway } from 'src/socket/socket.gateway';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class MessageService {
    private readonly ttlSeconds: number;
    private readonly messageSelect = {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
    }

    constructor(
        private readonly prisma: PrismaService,
        private readonly handleErrorsService: HandleErrorsService,
        private readonly findEntityByIdService: FindEntityByIdService,
        private readonly socketService: SocketService,
        private readonly socketGateway: SocketGateway,
        private readonly redis: RedisService,
        private readonly config: ConfigService
    ) {
        this.ttlSeconds = Number(this.config.get('REDIS_TTL_SECONDS') || 60);
    }

    async createMessage(data: any) {

        const { idempotencyKey, receiverId, senderId } = data;

        const existingMessage = await this.prisma.message.findUnique({
            where: { idempotencyKey },
            select: this.messageSelect
        });

        if (existingMessage) {
            this.useSocketService("create", receiverId, existingMessage, senderId, { status: "success", message: "Message created successfully", data: existingMessage });
            return
        }

        const message = await this.prisma.message.create({
            data,
            select: this.messageSelect,
        });

        // invalidate conversation cache
        await this.disableCache(senderId, receiverId);

        this.useSocketService("create", receiverId, message, senderId, { status: "success", message: "Message created successfully", data: message });
    }

    async getMessages(senderId: string, receiverId: string) {

        const cacheKey = this.generateCacheKey(senderId, receiverId);

        try {
            // 1) check cache
            const cachedMessages = await this.redis.get(cacheKey);

            if (cachedMessages) {
                const messages = JSON.parse(cachedMessages);
                return { data: messages, message: 'Messages fetched successfully from cache' };
            }

            // 2) fallback to DB
            const messages = await this.prisma.message.findMany({
                where: {
                    OR: [
                        { senderId, receiverId },
                        { senderId: receiverId, receiverId: senderId }
                    ]
                },
                orderBy: { createdAt: 'desc' }
            });

            // 3) store in cache with TTL
            await this.redis.set(cacheKey, JSON.stringify(messages), this.ttlSeconds);

            return {
                data: messages,
                message: "Messages fetched successfully from DB"
            }
        }

        catch (error) {
            this.handleErrorsService.handleError(error)
        }
    }

    async updateMessage(data: any) {

        const { senderId, messageId, receiverId, content } = data

        const message = await this.findEntityByIdService.findEntityById("message", messageId, { senderId: true })

        if (message?.senderId !== senderId) {
            this.socketService.sendResponse(senderId, { status: "failed", message: "You are not authorized to update this message" });
            return;
        }

        const updatedMessage = await this.prisma.message.update({
            where: { id: messageId },
            data: { content },
            select: this.messageSelect
        });

        // invalidate conversation cache
        await this.disableCache(senderId, receiverId);

        this.useSocketService("update", receiverId, updatedMessage, senderId, { status: "success", message: "Message updated successfully", data: updatedMessage });
    }

    async deleteMessage(data: any) {

        const { messageId, senderId, receiverId } = data

        const message = await this.findEntityByIdService.findEntityById("message", messageId, { senderId: true })

        if (message?.senderId !== senderId) {
            this.socketService.sendResponse(senderId, { status: "failed", message: "You are not authorized to delete this message" });
            return
        }

        const deletedMessage = await this.prisma.message.delete({
            where: { id: messageId },
            select: this.messageSelect
        });

        // invalidate conversation cache
        await this.disableCache(senderId, receiverId);

        this.useSocketService("delete", receiverId, deletedMessage, senderId, { status: "success", message: "Message deleted successfully", data: deletedMessage });
    }

    private useSocketService(action: string, receiverId: string, message: any, senderId: string, response: any) {
        switch (action) {
            case "create":
                this.socketGateway.sendCreatedMessage(receiverId, message);
                break;

            case "update":
                this.socketGateway.sendUpdatedMessage(receiverId, message);
                break;

            case "delete":
                this.socketGateway.sendDeletedMessage(receiverId, message);
                break;

            default:
                break;
        }

        this.socketService.sendResponse(senderId, response);
    }

    private async disableCache(senderId: string, receiverId: string) {
        const cacheKey = this.generateCacheKey(senderId, receiverId);

        await this.redis.del(cacheKey);
    }

    private generateCacheKey(userId1: string, userId2: string): string {
        const [first, second] = [userId1, userId2].sort();
        return `messages:${first}:${second}`;
    }
}
