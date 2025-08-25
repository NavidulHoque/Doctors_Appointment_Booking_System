import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { CommonModule } from 'src/common/common.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { SocketModule } from 'src/socket/socket.module';
import { MessageProducerService } from './message.producer.service';
import { MessageConsumer } from './message.consumer';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [CommonModule, PrismaModule, ConfigModule, SocketModule, KafkaModule],
  controllers: [MessageController],
  providers: [MessageService, MessageProducerService, MessageConsumer]
})
export class MessageModule {}
