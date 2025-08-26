import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HandleErrorsService } from 'src/common/handleErrors.service';
import { UserDto } from 'src/user/dto';
import { FindEntityByIdService } from 'src/common/FindEntityById.service';
import { SocketService } from 'src/common/socket.service';
import { messageSelect } from 'src/prisma/prisma-selects';

@Injectable()
export class MessageService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly handleErrorsService: HandleErrorsService,
        private readonly findEntityByIdService: FindEntityByIdService,
        private readonly socketService: SocketService,
    ) { }

    async createMessage(data: any) {

        const { idempotencyKey, receiverId, senderId } = data;

        const existingMessage = await this.prisma.message.findUnique({
            where: { idempotencyKey },
        });

        if (existingMessage) {
            this.useSocketService(receiverId, existingMessage, senderId, { status: "success", message: "Message created successfully", data: existingMessage });
            return
        }

        const message = await this.prisma.message.create({
            data,
            select: messageSelect,
        });

        this.useSocketService(receiverId, message, senderId, { status: "success", message: "Message created successfully", data: message });
    }

    async getMessages(user: UserDto, receiverId: string) {

        const { id: senderId } = user

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
        }

        const updatedMessage = await this.prisma.message.update({
            where: { id: messageId },
            data: { content },
            select: messageSelect
        });

        this.useSocketService(receiverId, updatedMessage, senderId, { status: "success", message: "Message created successfully", data: updatedMessage });
    }

    
    async deleteMessage(data: any) {
        
        const { messageId, senderId, receiverId } = data
        
        const message = await this.findEntityByIdService.findEntityById("message", messageId, { senderId: true })

        if (message?.senderId !== senderId) {
            this.socketService.sendResponse(senderId, { status: "failed", message: "You are not authorized to update this message" });
        }
        
        const deletedMessage = await this.prisma.message.delete({ 
            where: { id: messageId },
            select: messageSelect
        });
        
        this.useSocketService(receiverId, deletedMessage, senderId, { status: "success", message: "Message created successfully", data: deletedMessage });
    }

    private useSocketService(receiverId: string, message: any, senderId: string, response: any) {
        this.socketService.sendMessage(receiverId, message);
    
        this.socketService.sendResponse(senderId, response);
    }
}
