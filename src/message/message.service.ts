import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HandleErrorsService } from 'src/common/handleErrors.service';
import { UserDto } from 'src/user/dto';
import { FindEntityByIdService } from 'src/common/FindEntityById.service';
import { SocketService } from 'src/common/socket.service';
import { messageSelect } from 'src/prisma/prisma-selects';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class MessageService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly handleErrorsService: HandleErrorsService,
        private readonly findEntityByIdService: FindEntityByIdService,
        private readonly socketService: SocketService,
        private readonly socketGateway: SocketGateway
    ) { }

    async createMessage(data: any) {

        const { idempotencyKey, receiverId, senderId } = data;

        const existingMessage = await this.prisma.message.findUnique({
            where: { idempotencyKey },
            select: messageSelect
        });

        if (existingMessage) {
            this.useSocketService("create", receiverId, existingMessage, senderId, { status: "success", message: "Message created successfully", data: existingMessage });
            return
        }

        const message = await this.prisma.message.create({
            data,
            select: messageSelect,
        });

        this.useSocketService("create", receiverId, message, senderId, { status: "success", message: "Message created successfully", data: message });
    }

    async getMessages(senderId: string, receiverId: string) {

        try {
            const messages = await this.prisma.message.findMany({
                where: {
                    OR: [
                        { senderId, receiverId },
                        { senderId: receiverId, receiverId: senderId }
                    ]
                },
                orderBy: { createdAt: 'desc' }
            });

            return {
                data: messages,
                message: "Messages fetched successfully"
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
            select: messageSelect
        });

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
            select: messageSelect
        });
        
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
}
