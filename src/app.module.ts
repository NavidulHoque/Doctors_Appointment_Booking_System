import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppointmentModule } from './appointment/appointment.module';
import { DoctorModule } from './doctor/doctor.module';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewModule } from './review/review.module';
import { MessageModule } from './message/message.module';
import { BullModule } from '@nestjs/bull';
import { NotificationModule } from './notification/notification.module';
import { PaymentModule } from './payment/payment.module';
import { WebhookModule } from './webhook/webhook.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsModule } from './uploads/uploads.module';
import { SocketModule } from './socket/socket.module';
import { KafkaModule } from './kafka/kafka.module';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RedisService } from './redis/redis.service';
import { RedisThrottlerStorage } from './redis/redis-throttler.storage';
import { SmsModule } from './sms/sms.module';
import { CronModule } from './cron/cron.module';
import { JwtModule } from '@nestjs/jwt';
import { McpModule } from './mcp/mcp.module';
import { OpenAiModule } from './gemini/gemini.module';
import { AuthHelperModule } from './auth/helpers/auth-helper.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost', // or 'redis' if running in Docker
        port: parseInt(process.env.REDIS_PORT || '6385', 10),
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisService],
      useFactory: (redis: RedisService) => ({
        throttlers: [{ ttl: seconds(60), limit: 10 }], // seconds() -> ms helper
        storage: new RedisThrottlerStorage(redis),     // reuse your RedisService
      }),
    }),
    JwtModule.register({
      global: true,     // makes jwtService global
    }),
    ConfigModule.forRoot({
      isGlobal: true,   // makes ConfigService global
    }),
    ScheduleModule.forRoot(), // for cron jobs to run
    AuthModule,
    UserModule,
    AppointmentModule,
    DoctorModule,
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
    EmailModule,
    SmsModule,
    CronModule,
    McpModule,
    OpenAiModule,
    AuthHelperModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ]
})
export class AppModule { }
