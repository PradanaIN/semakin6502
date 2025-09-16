import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
  Query,
  Put,
  Delete,
  ForbiddenException,
} from "@nestjs/common";
import { Request } from "express";
import { TambahanService } from "./tugas-tambahan.service";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";
import { Roles } from "@shared/guards/roles.decorator";
import { ROLES } from "@shared/constants/roles.constants";
import { AddTambahanDto } from "./dto/add-tambahan.dto";
import { UpdateTambahanDto } from "./dto/update-tambahan.dto";
import { SubmitTambahanLaporanDto } from "./dto/submit-tambahan-laporan.dto";
import { AuthRequestUser } from "@shared/interfaces/auth-request-user.interface";
import { ApiTags } from "@nestjs/swagger";
import { PrismaService } from "@core/database/prisma.service";

@ApiTags("tugas-tambahan")
@Controller("tugas-tambahan")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TambahanController {
  constructor(
    private readonly tambahanService: TambahanService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @Roles(ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA)
  add(@Body() body: AddTambahanDto, @Req() req: Request) {
    const userId = (req.user as AuthRequestUser).userId;
    return this.tambahanService.add({ ...body, userId });
  }

  @Get()
  getByUser(@Req() req: Request) {
    const userId = (req.user as AuthRequestUser).userId;
    return this.tambahanService.getByUser(userId);
  }

  @Get('all')
  @Roles(ROLES.ADMIN, ROLES.PIMPINAN, ROLES.KETUA)
  async getAll(
    @Query('teamId') teamId: string | undefined,
    @Query('userId') userId: string | undefined,
    @Req() req: Request,
  ) {
    const { role, userId: requesterId } = req.user as AuthRequestUser;
    if (role === ROLES.KETUA && teamId) {
      const leader = await this.prisma.member.findFirst({
        where: { teamId, userId: requesterId, isLeader: true },
      });
      if (!leader) {
        throw new ForbiddenException('bukan ketua tim');
      }
    }
    return this.tambahanService.getAll({ teamId, userId });
  }

  @Post(":id/laporan")
  addLaporan(
    @Param("id") id: string,
    @Body() body: SubmitTambahanLaporanDto,
    @Req() req: Request
  ) {
    const u = req.user as AuthRequestUser;
    return this.tambahanService.addLaporan(id, body, u.userId, u.role);
  }

  @Get(":id")
  detail(@Param("id") id: string, @Req() req: Request) {
    const { userId, role } = req.user as AuthRequestUser;
    return this.tambahanService.getOne(id, userId, role);
  }

  @Put(":id")
  @Roles(ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA)
  update(
    @Param("id") id: string,
    @Body() body: UpdateTambahanDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as AuthRequestUser).userId;
    return this.tambahanService.update(id, body, userId);
  }

  @Delete(":id")
  @Roles(ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA)
  remove(@Param("id") id: string, @Req() req: Request) {
    const userId = (req.user as AuthRequestUser).userId;
    return this.tambahanService.remove(id, userId);
  }
}
