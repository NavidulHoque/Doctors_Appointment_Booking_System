import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { CommonModule } from 'src/common/common.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [CommonModule, PrismaModule, ConfigModule, SocketModule],
  controllers: [MessageController],
  providers: [MessageService]
})
export class MessageModule {}
