import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageDto } from './dto';
import { HandleErrorsService } from 'src/common/handleErrors.service';
import { UserDto } from 'src/user/dto';
import { FindEntityByIdService } from 'src/common/FindEntityById.service';
import { SocketGateway } from 'src/socket/socket.gateway';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { KafkaProducerService } from 'src/kafka/kafka.service';

@Injectable()
export class MessageService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly handleErrorsService: HandleErrorsService,
        private readonly findEntityByIdService: FindEntityByIdService,
        private readonly socketGateway: SocketGateway,
        private readonly kafkaProducerService: KafkaProducerService
    ) { }

    async createMessage(dto: MessageDto, senderId: string) {

        const data = {
            ...dto,
            senderId
        }

        try {
            const response = await this.kafkaProducerService.createMessage('message-topic', data);

            return response
        }

        catch (error) {
            this.handleErrorsService.handleError(error)
        }
    }

    @MessagePattern('message-topic')
    async handleMessageTopic(@Payload() data: any) {

        try {
            const parsedData = JSON.parse(data.value);

            const message = await this.prisma.message.create({
                data: parsedData,
                select: {
                    id: true,
                    content: true,
                    createdAt: true
                }
            });

            // send message via WebSocket
            this.socketGateway.sendMessage(parsedData.receiverId, message)

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
