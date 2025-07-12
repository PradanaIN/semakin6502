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
  findAll() {
    return this.masterService.findAll();
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
