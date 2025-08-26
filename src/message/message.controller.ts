import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard } from 'src/auth/guard';
import { UserDto } from 'src/user/dto';
import { User } from 'src/user/decorator';
import { CheckRoleService } from 'src/common/checkRole.service';
import { MessageProducerService } from './message.producer.service';
import { CreateMessageDto, UpdateMessageDto } from './dto';

@UseGuards(AuthGuard)
@Controller('messages')
export class MessageController {

    constructor(
        private readonly messageService: MessageService,
        private readonly checkRoleService: CheckRoleService,
        private readonly messageProducerService: MessageProducerService
    ) { }

    @Post("/create-message")
    @HttpCode(202)
    async createMessage(
        @Body() dto: CreateMessageDto,
        @User() user: UserDto
    ) {
        this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)

        const data = {
            ...dto,
            senderId: user.id
        }

        return await this.messageProducerService.sendCreateMessage(data);
    }

    @Get("/get-messages/:receiverId")
    getMessages(
        @User() user: UserDto,
        @Param('receiverId') receiverId: string
    ) {
        this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)
        return this.messageService.getMessages(user, receiverId);
    }

    @Patch("/update-message/:id")
    @HttpCode(202)
    async updateMessage(
        @Param('messageId') messageId: string,
        @Body() dto: UpdateMessageDto,
        @User() user: UserDto
    ) {
        this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)

        const data = {
            ...dto,
            messageId,
            senderId: user.id
        }

        return await this.messageProducerService.sendUpdateMessage(data);
    }
    
    @Delete("/delete-message/:messageId/:receiverId")
    @HttpCode(202)
    async deleteMessage(
        @Param('messageId') messageId: string,
        @Param('receiverId') receiverId: string,
        @User() user: UserDto
    ) {
        this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)

        const data = {
            receiverId,
            messageId,
            senderId: user.id
        }

        return await this.messageProducerService.sendDeleteMessage(data);
    }
}
