import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(userId: string, content: string) {
    await this.prisma.notifications.create({
      data: {
        userId,
        content,
      },
    });
  }
}
