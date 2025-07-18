import { Controller, Get, Post } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post("read-all")
  markAllAsRead() {
    this.service.markAllAsRead();
    return { message: "ok" };
  }
}
