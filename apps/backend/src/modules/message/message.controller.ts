import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MessageService } from '@dab/backend/modules/message/message.service';
import { CreateMessageDto } from '@dab/backend/modules/message/dtos/create-message.dto';
import { UpdateMessageDto } from '@dab/backend/modules/message/dtos/update-message.dto';
import { CurrentUser } from '@dab/backend/common/decorators/current-user.decorator';
import type { User } from '@dab/database';

@ApiTags('messages')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
@Controller('messages')
export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	@Post()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Send a message to another user' })
	@ApiOkResponse({ description: 'Message sent successfully' })
	createMessage(@Body() dto: CreateMessageDto, @CurrentUser() user: User) {
		return this.messageService.createMessage(dto, user.id);
	}

	@Get(':otherUserId')
	@ApiOperation({ summary: 'Get conversation thread with another user' })
	@ApiParam({ name: 'otherUserId', description: 'The other participant UUID' })
	@ApiOkResponse({ description: 'List of messages in the conversation' })
	getMessages(@Param('otherUserId') otherUserId: string, @CurrentUser() user: User) {
		return this.messageService.getMessages(user.id, otherUserId);
	}

	@Patch(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Edit a sent message' })
	@ApiParam({ name: 'id', description: 'Message UUID' })
	@ApiOkResponse({ description: 'Message updated successfully' })
	@ApiNotFoundResponse({ description: 'Message not found' })
	@ApiForbiddenResponse({ description: 'Can only edit own messages' })
	updateMessage(@Param('id') id: string, @Body() dto: UpdateMessageDto, @CurrentUser() user: User) {
		return this.messageService.updateMessage(dto, id, user.id);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete a sent message' })
	@ApiParam({ name: 'id', description: 'Message UUID' })
	@ApiOkResponse({ description: 'Message deleted successfully' })
	@ApiNotFoundResponse({ description: 'Message not found' })
	@ApiForbiddenResponse({ description: 'Can only delete own messages' })
	deleteMessage(@Param('id') id: string, @CurrentUser() user: User) {
		return this.messageService.deleteMessage(id, user.id);
	}
}
