import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageDto } from './dto';
import { HandleErrorsService } from 'src/common/handleErrors.service';
import { UserDto } from 'src/user/dto';
import { FindEntityByIdService } from 'src/common/FindEntityById.service';

@Injectable()
export class MessageService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly handleErrorsService: HandleErrorsService,
        private readonly findEntityByIdService: FindEntityByIdService
    ) { }

    async createMessage(dto: MessageDto, senderId: string) {

        try {
            const message = await this.prisma.message.create({
                data: {
                    ...dto,
                    senderId
                }
            });

            return {
                data: message,
                message: "Message created successfully"
            }
        }

        catch (error) {
            this.handleErrorsService.handleError(error)
        }
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

    async deleteMessage(id: string, user: UserDto) {

        const { id: userId } = user

        try {
            const message = await this.findEntityByIdService.findEntityById("message", id, { senderId: true })

            if (message?.senderId !== userId) {
                this.handleErrorsService.throwForbiddenError("You are not authorized to delete this message")
            }

            await this.prisma.message.delete({ where: { id } });

            return {
                message: "Message deleted successfully"
            }
        }

        catch (error) {
            this.handleErrorsService.handleError(error)
        }
    }
}
