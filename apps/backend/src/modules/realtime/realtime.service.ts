import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { RealtimeChannel } from '@dab/supabase';
import { SupabaseService } from '@dab/backend/modules/supabase/supabase.service';

@Injectable()
export class RealtimeService implements OnModuleInit {
	private readonly logger = new Logger(RealtimeService.name);
	private notificationsChannel!: RealtimeChannel;
	private messagesChannel!: RealtimeChannel;
	private eventsChannel!: RealtimeChannel;

	constructor(private readonly supabase: SupabaseService) {}

	onModuleInit() {
		this.notificationsChannel = this.supabase.admin
			.channel('notifications')
			.subscribe((status) => {
				if (status === 'SUBSCRIBED') this.logger.log('Realtime notifications channel ready');
			});

		this.messagesChannel = this.supabase.admin
			.channel('messages')
			.subscribe((status) => {
				if (status === 'SUBSCRIBED') this.logger.log('Realtime messages channel ready');
			});

		this.eventsChannel = this.supabase.admin
			.channel('events')
			.subscribe((status) => {
				if (status === 'SUBSCRIBED') this.logger.log('Realtime events channel ready');
			});
	}

	async broadcastNotification(userId: string, content: string): Promise<void> {
		await this.notificationsChannel.send({
			type: 'broadcast',
			event: 'notification',
			payload: { userId, content },
		});
	}

	async broadcastMessage(payload: {
		id: string;
		senderId: string;
		receiverId: string;
		content: string;
		createdAt: Date;
	}): Promise<void> {
		await this.messagesChannel.send({
			type: 'broadcast',
			event: 'new_message',
			payload,
		});
	}

	async broadcastMessageUpdate(payload: { id: string; content: string; updatedAt: Date }): Promise<void> {
		await this.messagesChannel.send({
			type: 'broadcast',
			event: 'message_updated',
			payload,
		});
	}

	async broadcastMessageDelete(messageId: string): Promise<void> {
		await this.messagesChannel.send({
			type: 'broadcast',
			event: 'message_deleted',
			payload: { id: messageId },
		});
	}

	async broadcastEvent(event: string, payload: Record<string, unknown>): Promise<void> {
		await this.eventsChannel.send({
			type: 'broadcast',
			event,
			payload,
		});
	}
}
