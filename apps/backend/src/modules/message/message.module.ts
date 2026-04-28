import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '@dab/database';
import { RealtimeModule } from '@backend/modules/realtime/realtime.module';
import { MessageService } from '@backend/modules/message/message.service';
import { MessageController } from '@backend/modules/message/message.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Message]), RealtimeModule],
	providers: [MessageService],
	controllers: [MessageController],
})
export class MessageModule {}
