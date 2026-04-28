import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '@dab/database';
import { RealtimeService } from '@backend/modules/realtime/realtime.service';
import { EmailService } from '@backend/modules/email/email.service';
import { EnvService } from '@backend/modules/config/env.service';
import { PaginationResponseDto } from '@backend/common/dtos/pagination.dto';
import type { GetNotificationsDto } from '@backend/modules/notification/dtos/query-notification.dto';

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name);

	constructor(
		@InjectRepository(Notification)
		private readonly notificationRepo: Repository<Notification>,
		private readonly realtime: RealtimeService,
		private readonly email: EmailService,
		private readonly env: EnvService,
	) {}

	async sendNotification(userId: string, content: string): Promise<void> {
		await this.createNotification(userId, content);

		await this.realtime
			.broadcastNotification(userId, content)
			.catch(async (err) => {
				this.logger.error(`Failed to broadcast notification for user ${userId}:`, err);
				await this.email
					.alertAdmin(
						'Failed to broadcast notification',
						`userId=${userId}, content="${content}", error=${err.message}`,
					)
					.catch((emailErr) =>
						this.logger.error('Failed to alert admin via email:', emailErr),
					);
			});
	}

	async createNotification(userId: string, content: string): Promise<Notification> {
		const notification = this.notificationRepo.create({ userId, content });
		return this.notificationRepo.save(notification);
	}

	async getAllNotifications(userId: string, query: GetNotificationsDto) {
		const { page, limit } = query;
		const skip = (page - 1) * limit;

		const [notifications, total] = await this.notificationRepo.findAndCount({
			where: { userId },
			order: { createdAt: 'DESC' },
			skip,
			take: limit,
		});

		return {
			notifications,
			pagination: new PaginationResponseDto(total, page, limit),
			message: 'Notifications fetched successfully',
		};
	}
}
