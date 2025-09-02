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
import { Request } from 'express';

interface RequestWithTrace extends Request {
  traceId: string;
}

@UseGuards(AuthGuard, RolesGuard)
@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageProducerService: MessageProducerService,
  ) {}

  @Post('/create-message')
  @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
  @HttpCode(202)
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
  getMessages(
    @User('id') userId: string,
    @Query('receiverId') receiverId: string,
  ) {
    return this.messageService.getMessages(userId, receiverId);
  }

  @Patch('/update-message/:id')
  @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
  @HttpCode(202)
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
