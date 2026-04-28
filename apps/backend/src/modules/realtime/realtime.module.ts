import { Module } from '@nestjs/common';
import { RealtimeService } from '@backend/modules/realtime/realtime.service';

@Module({
	providers: [RealtimeService],
	exports: [RealtimeService],
})
export class RealtimeModule {}
