import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth';
import { UserModule } from './user';
import { AppointmentModule } from './appointment';
import { DoctorModule } from './doctor';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma';
import { ReviewModule } from './review';
import { MessageModule } from './message';
import { BullModule } from '@nestjs/bull';
import { NotificationModule } from './notification';
import { PaymentModule } from './payment';
import { WebhookModule } from './webhook';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsModule } from './uploads';
import { SocketModule } from './socket';
import { KafkaModule } from './kafka';
import { RedisModule, RedisService, RedisThrottlerStorage } from './redis';
import { EmailModule } from './email';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SmsModule } from './sms';
import { CronModule } from './cron';
import { JwtModule } from '@nestjs/jwt';
import { McpModule } from './mcp';
import { OpenAiModule } from './gemini';
import { CommonModule } from './common/services';
import { AuthHelperModule } from './auth/helpers';
import { appConfigSchema } from './config';

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
      validate: (env) => appConfigSchema.parse(env),
    }),
    ScheduleModule.forRoot(), // for cron jobs to run
    AuthModule,
    AuthHelperModule,
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
    CommonModule
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
