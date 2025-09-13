import { InjectQueue } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bull";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";
import { SocketGateway } from "src/socket/socket.gateway";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
    private readonly redis: RedisService,
    @InjectQueue("notification-queue") private readonly notificationQueue: Queue
  ) { }

  async createNotification(userId: string, content: string, traceId: string) {
    try {
      this.logger.log(`📢 Creating notification for userId=${userId} with traceId=${traceId}`);

      const notification = await this.prisma.notification.create({
        data: {
          userId,
          content,
        },
        select: {
          id: true,
          content: true,
          createdAt: true
        }
      });

      // disable cache
      this.redis.del(`cache:GET:/notifications:user:${userId}`)
        .catch(error => {
          this.logger.error(`❌ Failed to disable cache for userId=${userId}. Reason: ${error.message}`);
        });

      this.logger.log(`✅ Notification created for userId=${userId}, traceId=${traceId}`);

      // send notification via WebSocket
      this.socketGateway.sendNotification(userId, traceId, notification);
    }

    catch (error) {
      this.logger.error(
        `❌ Failed to create notification for userId=${userId} with traceId=${traceId}. Reason: ${error.message}, Retrying...`,
      );

      throw error; // rethrow → BullMQ will retry according to attempts/backoff
    }
  }

  async getAllNotifications(userId: string, page: number = 1, limit: number = 10) {

    const [notifications, totalItems] = await this.prisma.$transaction([

      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          createdAt: true
        },
        skip: (page - 1) * limit,
        take: limit
      }),

      this.prisma.notification.count({
        where: { userId }
      })
    ]);

    return {
      notifications,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        itemsPerPage: limit
      },
      message: "Notifications retrieved successfully",
    }
  }

  async sendNotifications(userId: string, content: string, traceId: string, delay: number = 0, metadata: Record<string, any> = {}) {

    await this.notificationQueue.add(
      'send-notification',
      { userId, content, traceId, metadata },
      {
        delay,
        backoff: { type: 'exponential', delay: 5000 },
        attempts: 5,           // retry up to 5 times if the job fails
        removeOnComplete: true, // remove from queue after success
        removeOnFail: false,    // keep in queue if failed
      }
    );
  }
}
