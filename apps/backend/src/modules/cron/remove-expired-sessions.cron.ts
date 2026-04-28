import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Session } from '@dab/database';

@Injectable()
export class RemoveExpiredSessionsCronService {
	private readonly logger = new Logger(RemoveExpiredSessionsCronService.name);

	constructor(
		@InjectRepository(Session)
		private readonly sessionRepo: Repository<Session>,
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async removeExpiredSessions() {
		const result = await this.sessionRepo.delete({ expiresAt: LessThan(new Date()) });

		if (result.affected) {
			this.logger.log(`Removed ${result.affected} expired session(s)`);
		}
	}
}
