import { Module } from '@nestjs/common';
import { InactiveUserCronService } from './inactiveUserCron.service';
import { RemoveExpiredSessionsCronService } from './removeExpiredSessionsCron.service';

@Module({
    providers: [InactiveUserCronService, RemoveExpiredSessionsCronService]
})
export class CronModule {}
