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
import { AuthRequestUser } from "../common/auth-request-user.interface";
import { MasterKegiatanService } from "./master-kegiatan.service";
import { CreateMasterKegiatanDto } from "./dto/create-master-kegiatan.dto";
import { UpdateMasterKegiatanDto } from "./dto/update-master-kegiatan.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.decorator";
import { ROLES } from "../common/roles.constants";

@Controller("master-kegiatan")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN, ROLES.KETUA)
export class MasterKegiatanController {
  constructor(private readonly masterService: MasterKegiatanService) {}

  @Post()
  create(
    @Body() body: CreateMasterKegiatanDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthRequestUser;
    return this.masterService.create(body, u.userId, u.role);
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
    @Body() body: UpdateMasterKegiatanDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthRequestUser;
    return this.masterService.update(id, body, u.userId, u.role);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    const u = req.user as AuthRequestUser;
    return this.masterService.remove(id, u.userId, u.role);
  }
}
