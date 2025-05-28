import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageDto } from './dto';
import { AuthGuard } from 'src/auth/guard';
import { UserDto } from 'src/user/dto';
import { User } from 'src/user/decorator';
import { CheckRoleService } from 'src/common/checkRole.service';

@UseGuards(AuthGuard)
@Controller('messages')
export class MessageController {

    constructor(
        private readonly messageService: MessageService,
        private checkRoleService: CheckRoleService
    ) { }

    @Post("/create-message")
    async createMessage(
        @Body() dto: MessageDto, 
        @User() user: UserDto
    ) {
        this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)
        return this.messageService.createMessage(dto, user.id);
    }

    
    @Get("/get-messages/:receiverId")
    async getMessages(
        @User() user: UserDto,
        @Param('receiverId') receiverId: string
    ) {
        this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)
        return this.messageService.getMessages(user, receiverId);
    }
    
    @Delete("/delete-message/:id")
    async deleteMessage(
        @Param('id') id: string,
        @User() user: UserDto
    ) {
        this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)
        return this.messageService.deleteMessage(id, user);
    }
}
