import { Injectable } from "@nestjs/common";
import { ulid } from "ulid";
import { PrismaService } from "../prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, text: string, link?: string) {
    return this.prisma.notification.create({
      data: { id: ulid(), userId, text, link },
    });
  }

  findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  deleteByLink(link: string) {
    return this.prisma.notification.deleteMany({
      where: { link },
    });
  }
}
