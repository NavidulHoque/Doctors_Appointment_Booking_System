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
import { RequestWithTrace, RequestWithUser } from './types';
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
        invalidate: CacheKeyHelper.messagesPair,
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
        key: (req: RequestWithUser) => {
            const sid = String(req.user!.id ?? '');
            const rid = String(req.query.receiverId ?? '');
            const [a, b] = [sid, rid].sort();
            return `cache:GET:/messages:pair:${a}:${b}`;
        },
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
        invalidate: CacheKeyHelper.messagesPair,
    })
    updateMessage(
        @Param('id', EntityByIdPipe('message', { senderId: true, id: true }))
        message: any,
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

    @Delete('/delete-message/:messageId')
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    @HttpCode(202)
    @Cache({
        enabled: true,
        invalidate: CacheKeyHelper.messagesPair,
    })
    deleteMessage(
        @Param('id', EntityByIdPipe('message', { senderId: true, id: true }))
        message: any,
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
