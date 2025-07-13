import { Controller, Post, Get, Body, UseGuards, Req } from "@nestjs/common";
import { Request } from "express";
import { PenugasanService } from "./penugasan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.decorator";
import { AssignPenugasanDto } from "./dto/assign-penugasan.dto";
import { AssignPenugasanBulkDto } from "./dto/assign-penugasan-bulk.dto";

@Controller("penugasan")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PenugasanController {
  constructor(private readonly penugasanService: PenugasanService) {}

  @Post()
  assign(@Body() body: AssignPenugasanDto, @Req() req: Request) {
    const u = req.user as any;
    return this.penugasanService.assign(body, u.userId, u.role);
  }

  @Post("bulk")
  assignBulk(@Body() body: AssignPenugasanBulkDto, @Req() req: Request) {
    const u = req.user as any;
    return this.penugasanService.assignBulk(body, u.userId, u.role);
  }

  @Get()
  findAll(@Req() req: Request) {
    const u = req.user as any;
    return this.penugasanService.findAll(u.role, u.userId);
  }
}
