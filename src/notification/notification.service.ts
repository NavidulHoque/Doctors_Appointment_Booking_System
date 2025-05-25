import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue("notification-queue") private notificationQueue: Queue
  ) { }

  async createNotification(userId: string, content: string) {
    await this.prisma.notification.create({
      data: {
        userId,
        content,
      }
    });
  }

  async sendNotifications(userId: string, content: string, delay: number = 0) {

    await this.notificationQueue.add(
      'send-notification',
      { userId, content },
      {
        delay,
        attempts: 3,           // retry up to 3 times if the job fails
        removeOnComplete: true // remove from queue after success
      }
    );
  }
}
