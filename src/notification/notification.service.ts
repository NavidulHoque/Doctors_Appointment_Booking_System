import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { HandleErrorsService } from "src/common/handleErrors.service";
import { PrismaService } from "src/prisma/prisma.service";
import { SocketGateway } from "src/socket/socket.gateway"; 

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly handleErrorsService: HandleErrorsService,
    private readonly socketGateway: SocketGateway,
    @InjectQueue("notification-queue") private readonly notificationQueue: Queue
  ) { }

  async createNotification(userId: string, content: string) {
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

    // send notification via WebSocket
    this.socketGateway.sendNotification(userId, notification);
  }


  async getAllNotifications(userId: string, page: number = 1, limit: number = 10) {

    try {
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
        data: notifications,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          itemsPerPage: limit
        },
        message: "Notifications retrieved successfully",
      }
    }

    catch (error) {
      this.handleErrorsService.handleError(error);
    }
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
