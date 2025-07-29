import { Controller, Get, Post, Param, ParseIntPipe, UseGuards, Req } from "@nestjs/common";
import { Request } from "express";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthRequestUser } from "../common/auth-request-user.interface";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  findMine(@Req() req: Request) {
    const userId = (req.user as AuthRequestUser).userId;
    return this.service.findByUser(userId);
  }

  @Post("read-all")
  markAllAsRead(@Req() req: Request) {
    const userId = (req.user as AuthRequestUser).userId;
    return this.service.markAllAsRead(userId);
  }

  @Post(":id/read")
  markRead(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const userId = (req.user as AuthRequestUser).userId;
    return this.service.markAsRead(id, userId);
  }
}
