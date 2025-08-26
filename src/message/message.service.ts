import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HandleErrorsService } from 'src/common/handleErrors.service';
import { UserDto } from 'src/user/dto';
import { FindEntityByIdService } from 'src/common/FindEntityById.service';
import { SocketService } from 'src/common/socket.service';

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
            select: {
                id: true,
                content: true,
                createdAt: true,
            },
        });

        this.useSocketService(receiverId, message, senderId, { status: "success", message: "Message created successfully", data: message });
    }

    private useSocketService(receiverId: string, message: any, senderId: string, response: any) {
        this.socketService.sendMessage(receiverId, message);

        this.socketService.sendResponse(senderId, response);
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

        const { senderId, id, dto } = data

        const message = await this.findEntityByIdService.findEntityById("message", id, { senderId: true })

        if (message?.senderId !== senderId) {
            this.handleErrorsService.throwForbiddenError("You are not authorized to update this message")
        }

        const updatedMessage = await this.prisma.message.update({
            where: { id },
            data: dto,
            select: {
                id: true,
                content: true,
                createdAt: true
            }
        });

        this.socketService.sendResponse(senderId, { status: "success", message: "Message updated successfully", data: updatedMessage });
    }

    async deleteMessage(data: any) {

        const { id, senderId } = data

        const message = await this.findEntityByIdService.findEntityById("message", id, { senderId: true })

        if (message?.senderId !== senderId) {
            this.handleErrorsService.throwForbiddenError("You are not authorized to delete this message")
        }

        await this.prisma.message.delete({ where: { id } });

        this.socketService.sendResponse(senderId, { status: "success", message: "Message deleted successfully" });
    }
}
