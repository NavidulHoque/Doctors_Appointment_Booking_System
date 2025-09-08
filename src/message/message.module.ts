import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageProducerService } from './message.producer.service';
import { MessageConsumer } from './message.consumer';

@Module({
  controllers: [MessageController, MessageConsumer],
  providers: [MessageService, MessageProducerService]
})
export class MessageModule {}
