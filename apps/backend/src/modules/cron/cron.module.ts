import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Session } from '@dab/database';
import { InactiveUserCronService } from '@dab/backend/modules/cron/inactive-user.cron';
import { RemoveExpiredSessionsCronService } from '@dab/backend/modules/cron/remove-expired-sessions.cron';

@Module({
	imports: [TypeOrmModule.forFeature([User, Session])],
	providers: [InactiveUserCronService, RemoveExpiredSessionsCronService],
})
export class CronModule {}
