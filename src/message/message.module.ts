import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { CommonModule } from 'src/common/common.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MessageProducerService } from './message.producer.service';
import { MessageConsumer } from './message.consumer';
import { KafkaModule } from 'src/kafka/kafka.module';
import { SocketModule } from 'src/socket/socket.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [CommonModule, PrismaModule, ConfigModule, KafkaModule, SocketModule, ConfigModule, RedisModule],
  controllers: [MessageController, MessageConsumer],
  providers: [MessageService, MessageProducerService]
})
export class MessageModule {}
