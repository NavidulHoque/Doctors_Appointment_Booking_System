import { Module } from '@nestjs/common';
import { InactiveUserCronService } from './inactive-user-cron.service';
import { RemoveExpiredSessionsCronService } from './remove-expired-sessions-cron.service';

@Module({
    providers: [InactiveUserCronService, RemoveExpiredSessionsCronService]
})
export class CronModule {}
