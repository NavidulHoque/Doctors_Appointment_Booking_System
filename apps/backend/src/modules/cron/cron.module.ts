import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@dab/database';
import { InactiveUserCronService } from '@dab/backend/modules/cron/inactive-user.cron';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	providers: [InactiveUserCronService],
})
export class CronModule {}
