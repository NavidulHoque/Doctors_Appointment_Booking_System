import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { MessageProducerService } from './message.producer.service';
import { CreateMessageDto, UpdateMessageDto } from './dto';
import { Roles, User } from 'src/auth/decorators';
import { Role } from '@prisma/client';
import { EntityByIdPipe } from 'src/common/pipes';
import { Cache } from 'src/common/decorators';
import { RequestWithTrace } from '../common/types';
import { CacheKeyHelper } from './helper';

@UseGuards(AuthGuard, RolesGuard)
@Controller('messages')
export class MessageController {
    constructor(
        private readonly messageService: MessageService,
        private readonly messageProducerService: MessageProducerService,
    ) { }

    @Post('/create-message')
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    @HttpCode(202)
    @Cache({
        enabled: true,
        invalidate: CacheKeyHelper.generateMessagesKey
    })
    createMessage(
        @Body() dto: CreateMessageDto,
        @User('id') userId: string,
        @Req() request: RequestWithTrace,
    ) {
        const traceId = request.traceId;
        const data = {
            ...dto,
            senderId: userId,
        };

        return this.messageProducerService.sendCreateMessage(data, traceId);
    }

    @Get('/get-messages')
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    @Cache({
        enabled: true,
        ttl: 60,
        key: CacheKeyHelper.generateMessagesKey
    })
    getMessages(
        @User('id') userId: string,
        @Query('receiverId') receiverId: string,
    ) {
        return this.messageService.getMessages(userId, receiverId);
    }

    @Patch('/update-message/:id')
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    @HttpCode(202)
    @Cache({
        enabled: true,
        invalidate: CacheKeyHelper.generateMessagesKey
    })
    updateMessage(
        @Param('id', EntityByIdPipe('message', { senderId: true, id: true }))
        message: Record<string, any>,
        @Body() dto: UpdateMessageDto,
        @User('id') userId: string,
        @Req() request: RequestWithTrace,
    ) {
        const traceId = request.traceId;
        const data = {
            ...dto,
            message,
            senderId: userId,
        };

        return this.messageProducerService.sendUpdateMessage(data, traceId);
    }

    @Delete('/delete-message/:id')
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    @HttpCode(202)
    @Cache({
        enabled: true,
        invalidate: CacheKeyHelper.generateMessagesKey
    })
    deleteMessage(
        @Param('id', EntityByIdPipe('message', { senderId: true, id: true }))
        message: Record<string, any>,
        @Query('receiverId') receiverId: string,
        @User('id') userId: string,
        @Req() request: RequestWithTrace,
    ) {
        const traceId = request.traceId;
        const data = {
            receiverId,
            message,
            senderId: userId,
        };

        return this.messageProducerService.sendDeleteMessage(data, traceId);
    }
}
