import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly socketGateway: SocketGateway,
  ) {
    this.ttlSeconds = Number(this.config.get('REDIS_TTL_SECONDS') || 60);
  }

  async createMessage(data: any, traceId: string) {
    const { idempotencyKey, receiverId, senderId } = data;
    console.log(`[ℹ️] traceId=${traceId} Creating message with idempotencyKey=${idempotencyKey}`);

    const existingMessage = await this.prisma.message.findUnique({
      where: { idempotencyKey },
      select: this.messageSelect,
    });

    if (existingMessage) {
      this.useSocketService('create', receiverId, existingMessage, senderId, traceId, {
        status: 'success',
        message: 'Message created successfully',
        data: existingMessage,
      });
      return;
    }

    const message = await this.prisma.message.create({
      data,
      select: this.messageSelect,
    });

    await this.disableCache(senderId, receiverId);

    this.useSocketService('create', receiverId, message, senderId, traceId, {
      status: 'success',
      message: 'Message created successfully',
      data: message,
    });
  }

  async getMessages(senderId: string, receiverId: string) {
    const cacheKey = this.generateCacheKey(senderId, receiverId);

    const cachedMessages = await this.redis.get(cacheKey);

    if (cachedMessages) {
      const messages = JSON.parse(cachedMessages);
      return { data: messages, message: 'Messages fetched successfully from cache' };
    }

    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    await this.redis.set(cacheKey, JSON.stringify(messages), this.ttlSeconds);

    return {
      data: messages,
      message: 'Messages fetched successfully from DB',
    };
  }

  async updateMessage(data: any, traceId: string) {
    const { senderId, message, receiverId, content } = data;

    if (message.senderId !== senderId) {
      this.socketGateway.sendResponse(senderId, {
        traceId,
        status: 'failed',
        message: 'You are not authorized to update this message',
      });

      return;
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id: message.id },
      data: { content },
      select: this.messageSelect,
    });

    await this.disableCache(senderId, receiverId);

    this.useSocketService('update', receiverId, updatedMessage, senderId, traceId, {
      status: 'success',
      message: 'Message updated successfully',
      data: updatedMessage,
    });
  }

  async deleteMessage(data: any, traceId: string) {
    const { message, senderId, receiverId } = data;

    if (message.senderId !== senderId) {
      this.socketGateway.sendResponse(senderId, {
        traceId,
        status: 'failed',
        message: 'You are not authorized to delete this message',
      });

      return;
    }

    const deletedMessage = await this.prisma.message.delete({
      where: { id: message.id },
      select: this.messageSelect,
    });

    await this.disableCache(senderId, receiverId);

    this.useSocketService('delete', receiverId, deletedMessage, senderId, traceId, {
      status: 'success',
      message: 'Message deleted successfully',
      data: deletedMessage,
    });
  }

  private useSocketService(
    action: string,
    receiverId: string,
    message: any,
    senderId: string,
    traceId: string,
    response: any,
  ) {
    switch (action) {
      case 'create':
        this.socketGateway.sendCreatedMessage(receiverId, message);
        break;
      case 'update':
        this.socketGateway.sendUpdatedMessage(receiverId, message);
        break;
      case 'delete':
        this.socketGateway.sendDeletedMessage(receiverId, message);
        break;
    }

    this.socketGateway.sendResponse(senderId, { traceId, ...response });
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
