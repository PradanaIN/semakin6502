import { Controller, Post, Get, Body, UseGuards, Req } from "@nestjs/common";
import { Request } from "express";
import { MasterKegiatanService } from "./master-kegiatan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.decorator";

@Controller("master-kegiatan")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MasterKegiatanController {
  constructor(private readonly masterService: MasterKegiatanService) {}

  @Post()
  @Roles("ketua")
  create(@Body() body: any, @Req() req: Request) {
    return this.masterService.create(body, (req.user as any).userId);
  }

  @Get()
  @Roles("ketua")
  findAll() {
    return this.masterService.findAll();
  }
}
