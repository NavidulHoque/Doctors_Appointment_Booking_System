import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { User } from '@dab/database';

@Injectable()
export class InactiveUserCronService {
	private readonly logger = new Logger(InactiveUserCronService.name);

	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
	) {}

	@Cron(CronExpression.EVERY_MINUTE)
	async markInactiveUsers() {
		const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

		const result = await this.userRepo.update(
			{ isOnline: true, lastActiveAt: LessThan(twoHoursAgo) },
			{ isOnline: false },
		);

		if (result.affected) {
			this.logger.log(`Marked ${result.affected} user(s) as offline`);
		}
	}
}
