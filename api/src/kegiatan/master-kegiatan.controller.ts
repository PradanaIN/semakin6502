import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
} from "@nestjs/common";
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
  create(@Body() body: any, @Req() req: Request) {
    return this.masterService.create(body, (req.user as any).userId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const { page, limit, team, search } = req.query;
    return this.masterService.findAll({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      teamId: team ? parseInt(team as string, 10) : undefined,
      search: search as string | undefined,
    });
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: any,
    @Req() req: Request,
  ) {
    return this.masterService.update(id, body, (req.user as any).userId);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return this.masterService.remove(id, (req.user as any).userId);
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: any,
    @Req() req: Request,
  ) {
    return this.masterService.update(id, body, (req.user as any).userId);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return this.masterService.remove(id, (req.user as any).userId);
  }
}
