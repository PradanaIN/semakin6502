import { Controller, Post, Get, Body, UseGuards, Req } from "@nestjs/common";
import { Request } from "express";
import { PenugasanService } from "./penugasan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.decorator";
import { AssignPenugasanDto } from "./dto/assign-penugasan.dto";

@Controller("penugasan")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PenugasanController {
  constructor(private readonly penugasanService: PenugasanService) {}

  @Post()
  @Roles("ketua")
  assign(@Body() body: AssignPenugasanDto, @Req() req: Request) {
    return this.penugasanService.assign(body, (req.user as any).userId);
  }

  @Get()
  @Roles("ketua")
  findAll() {
    return this.penugasanService.findAll();
  }
}
