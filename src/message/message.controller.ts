import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { MessageProducerService } from './message.producer.service';
import { CreateMessageDto, UpdateMessageDto } from './dto';
import { Roles, User } from 'src/auth/decorators';
import { Role } from 'src/auth/enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('messages')
export class MessageController {

    constructor(
        private readonly messageService: MessageService,
        private readonly messageProducerService: MessageProducerService
    ) { }

    @Post("/create-message")
    @Roles(Role.Admin, Role.Patient, Role.Doctor)
    @HttpCode(202)
    async createMessage(
        @Body() dto: CreateMessageDto,
        @User("id") userId: string
    ) {
        const data = {
            ...dto,
            senderId: userId
        }

        return await this.messageProducerService.sendCreateMessage(data);
    }

    @Get("/get-messages")
    @Roles(Role.Admin, Role.Patient, Role.Doctor)
    getMessages(
        @User("id") userId: string,
        @Query('receiverId') receiverId: string
    ) {
        return this.messageService.getMessages(userId, receiverId);
    }

    @Patch("/update-message/:messageId")
    @Roles(Role.Admin, Role.Patient, Role.Doctor)
    @HttpCode(202)
    async updateMessage(
        @Param('messageId') messageId: string,
        @Body() dto: UpdateMessageDto,
        @User("id") userId: string
    ) {
        const data = {
            ...dto,
            messageId,
            senderId: userId
        }

        return await this.messageProducerService.sendUpdateMessage(data);
    }
    
    @Delete("/delete-message/:messageId")
    @Roles(Role.Admin, Role.Patient, Role.Doctor)
    @HttpCode(202)
    async deleteMessage(
        @Param('messageId') messageId: string,
        @Query("receiverId") receiverId: string,
        @User("id") userId: string
    ) {
        const data = {
            receiverId,
            messageId,
            senderId: userId
        }

        return await this.messageProducerService.sendDeleteMessage(data);
    }
}
