import { Controller, Get, Post, Param, UseGuards, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { AuthRequestUser } from "@shared/interfaces/auth-request-user.interface";

@ApiTags("notifications")
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
  markRead(@Param("id") id: string, @Req() req: Request) {
    const userId = (req.user as AuthRequestUser).userId;
    return this.service.markAsRead(id, userId);
  }
}
