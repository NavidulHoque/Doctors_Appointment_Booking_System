import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppointmentModule } from './appointment/appointment.module';
import { DoctorModule } from './doctor/doctor.module';
import { AppController } from './app.controller';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewModule } from './review/review.module';
import { MessageModule } from './message/message.module';
import { BullModule } from '@nestjs/bull';
import { NotificationModule } from './notification/notification.module';
import { PaymentModule } from './payment/payment.module';
import { WebhookModule } from './webhook/webhook.module';
import { InactiveUserCronService } from './cron/inactiveUserCron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsModule } from './uploads/uploads.module';
import { SocketModule } from './socket/socket.module';
import { KafkaModule } from './kafka/kafka.module';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost', // or 'redis' if running in Docker
        port: parseInt(process.env.REDIS_PORT || '6385', 10),
      },
    }),
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(), // for cron jobs to run
    AuthModule, 
    UserModule, 
    AppointmentModule, 
    DoctorModule, 
    CommonModule, 
    PrismaModule, 
    ReviewModule, 
    MessageModule,
    NotificationModule,
    PaymentModule,
    WebhookModule,
    UploadsModule,
    SocketModule,
    KafkaModule,
    RedisModule,
    EmailModule
  ],
  controllers: [AppController],
  providers: [InactiveUserCronService]
})
export class AppModule { }
