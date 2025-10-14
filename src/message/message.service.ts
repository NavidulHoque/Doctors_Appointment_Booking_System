import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { SocketGateway } from 'src/socket';

@Injectable()
export class MessageService {
    private readonly logger = new Logger(MessageService.name);

    private readonly messageSelect = { id: true, content: true, createdAt: true, updatedAt: true };

    constructor(
        private readonly prisma: PrismaService,
        private readonly socketGateway: SocketGateway,
    ) { }

    async createMessage(data: any, traceId: string) {
        const { receiverId, senderId } = data;

        this.logger.log(`✉️ Creating message with traceId ${traceId}`);

        const message = await this.prisma.message.create({ data, select: this.messageSelect });

        this.logger.log(`✅ Message created with traceId ${traceId}`);

        this.useSocketService('create', receiverId, message, senderId, traceId, {
            status: 'success',
            message: 'Message created successfully',
            data: message,
        });
    }

    async getMessages(senderId: string, receiverId: string) {
        const messages = await this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });

        return { data: messages, message: 'Messages fetched successfully' };
    }

    async updateMessage(data: Record<string, any>, traceId: string) {
        const { senderId, message, receiverId, content } = data;

        if (message.senderId !== senderId) {
            this.socketGateway.sendResponse(senderId, {
                traceId, status: 'failed', message: 'You are not authorized to update this message',
            });
            return;
        }

        this.logger.log(`✉️ Updating message with traceId ${traceId}`);

        const updatedMessage = await this.prisma.message.update({
            where: { id: message.id },
            data: { content },
            select: this.messageSelect
        });

        this.logger.log(`✅ Message updated with traceId ${traceId}`);

        this.useSocketService('update', receiverId, updatedMessage, senderId, traceId, {
            status: 'success',
            message: 'Message updated successfully',
            data: updatedMessage,
        });
    }

    async deleteMessage(data: Record<string, any>, traceId: string) {
        const { message, senderId, receiverId } = data;

        if (message.senderId !== senderId) {
            this.socketGateway.sendResponse(senderId, {
                traceId, status: 'failed', message: 'You are not authorized to delete this message',
            });
            return;
        }

        this.logger.log(`✉️ Deleting message with traceId ${traceId}`);

        const deletedMessage = await this.prisma.message.delete({
            where: { id: message.id },
            select: this.messageSelect,
        });

        this.logger.log(`✅ Message deleted with traceId ${traceId}`);

        this.useSocketService('delete', receiverId, deletedMessage, senderId, traceId, {
            status: 'success',
            message: 'Message deleted successfully',
            data: deletedMessage,
        });
    }

    private useSocketService(
        action: 'create' | 'update' | 'delete',
        receiverId: string,
        message: any,
        senderId: string,
        traceId: string,
        response: any,
    ) {
        switch (action) {
            case 'create': this.socketGateway.sendCreatedMessage(receiverId, traceId, message); break;
            case 'update': this.socketGateway.sendUpdatedMessage(receiverId, traceId, message); break;
            case 'delete': this.socketGateway.sendDeletedMessage(receiverId, traceId, message); break;
        }
        this.socketGateway.sendResponse(senderId, { traceId, ...response });
    }
}
