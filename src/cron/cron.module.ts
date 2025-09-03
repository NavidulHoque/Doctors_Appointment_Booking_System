import { Module } from '@nestjs/common';
import { InactiveUserCronService } from './inactiveUserCron.service';
import { RemoveExpiredSessionsCronService } from './removeExpiredSessionsCron.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [InactiveUserCronService, RemoveExpiredSessionsCronService]
})
export class CronModule {}
