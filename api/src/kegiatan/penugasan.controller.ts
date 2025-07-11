import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { PenugasanService } from "./penugasan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.decorator";

@Controller("penugasan")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PenugasanController {
  constructor(private readonly penugasanService: PenugasanService) {}

  @Post()
  @Roles("ketua")
  assign(@Body() body: any) {
    return this.penugasanService.assign(body);
  }

  @Get()
  @Roles("ketua")
  findAll() {
    return this.penugasanService.findAll();
  }
}
