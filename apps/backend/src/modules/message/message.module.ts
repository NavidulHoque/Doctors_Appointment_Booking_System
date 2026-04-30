import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '@dab/database';
import { RealtimeModule } from '@dab/backend/modules/realtime/realtime.module';
import { MessageService } from '@dab/backend/modules/message/message.service';
import { MessageController } from '@dab/backend/modules/message/message.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Message]), RealtimeModule],
	providers: [MessageService],
	controllers: [MessageController],
})
export class MessageModule {}
