import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Message } from '@dab/database';
import { RealtimeService } from '@backend/modules/realtime/realtime.service';
import type { CreateMessageDto } from '@backend/modules/message/dtos/create-message.dto';
import type { UpdateMessageDto } from '@backend/modules/message/dtos/update-message.dto';

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(Message)
		private readonly messageRepo: Repository<Message>,
		private readonly realtime: RealtimeService,
	) {}

	async createMessage(dto: CreateMessageDto, senderId: string) {
		const message = await this.messageRepo.save(
			this.messageRepo.create({ content: dto.content, senderId, receiverId: dto.receiverId }),
		);

		await this.realtime
			.broadcastMessage({
				id: message.id,
				senderId: message.senderId,
				receiverId: message.receiverId,
				content: message.content,
				createdAt: message.createdAt,
			})
			.catch(() => {});

		return { data: message, message: 'Message sent successfully' };
	}

	async getMessages(userId: string, otherUserId: string) {
		const messages = await this.messageRepo
			.createQueryBuilder('msg')
			.where(
				new Brackets((b) =>
					b
						.where('msg.senderId = :a AND msg.receiverId = :b', { a: userId, b: otherUserId })
						.orWhere('msg.senderId = :b2 AND msg.receiverId = :a2', {
							b2: otherUserId,
							a2: userId,
						}),
				),
			)
			.orderBy('msg.createdAt', 'ASC')
			.getMany();

		return { data: messages, message: 'Messages fetched successfully' };
	}

	async updateMessage(dto: UpdateMessageDto, messageId: string, userId: string) {
		const message = await this.messageRepo.findOne({ where: { id: messageId } });
		if (!message) throw new NotFoundException('Message not found');

		if (message.senderId !== userId) throw new ForbiddenException("Cannot edit another user's message");

		await this.messageRepo.update({ id: messageId }, { content: dto.content });

		await this.realtime
			.broadcastMessageUpdate({ id: messageId, content: dto.content, updatedAt: new Date() })
			.catch(() => {});

		return { message: 'Message updated successfully' };
	}

	async deleteMessage(messageId: string, userId: string) {
		const message = await this.messageRepo.findOne({ where: { id: messageId } });
		if (!message) throw new NotFoundException('Message not found');

		if (message.senderId !== userId) throw new ForbiddenException('Cannot delete another user\'s message');

		await this.messageRepo.delete({ id: messageId });

		await this.realtime.broadcastMessageDelete(messageId).catch(() => {});

		return { message: 'Message deleted successfully' };
	}
}
