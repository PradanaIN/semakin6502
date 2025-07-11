import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { MonitoringService } from "./monitoring.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { PrismaService } from "../prisma.service";
import { Request } from "express";

@Controller("monitoring")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly prisma: PrismaService,
  ) {}

  @Get("harian")
  async harian(
    @Query("tanggal") tanggal?: string,
    @Req() req?: Request,
    @Query("teamId") teamId?: string,
    @Query("userId") userId?: string,
  ) {
    if (!tanggal) {
      throw new BadRequestException("query 'tanggal' diperlukan");
    }
    const user = req?.user as any;
    const role = user?.role;
    let tId = teamId ? parseInt(teamId, 10) : undefined;
    let uId = userId ? parseInt(userId, 10) : undefined;

    if (role !== "admin" && role !== "pimpinan") {
      const uid = user.userId;
      if (tId) {
        const member = await this.prisma.member.findFirst({
          where: { teamId: tId, userId: uid },
        });
        if (!member) throw new ForbiddenException("bukan anggota tim ini");
        if (!member.is_leader) {
          if (uId && uId !== uid)
            throw new ForbiddenException("bukan ketua tim");
          if (!uId) uId = uid;
        }
      } else {
        uId = uid;
      }
    }

    return this.monitoringService.harian(tanggal, tId, uId);
  }

  @Get("mingguan")
  async mingguan(
    @Query("minggu") minggu?: string,
    @Req() req?: Request,
    @Query("teamId") teamId?: string,
    @Query("userId") userId?: string,
  ) {
    if (!minggu) {
      throw new BadRequestException("query 'minggu' diperlukan");
    }
    const user = req?.user as any;
    const role = user?.role;
    let tId = teamId ? parseInt(teamId, 10) : undefined;
    let uId = userId ? parseInt(userId, 10) : undefined;

    if (role !== "admin" && role !== "pimpinan") {
      const uid = user.userId;
      if (tId) {
        const member = await this.prisma.member.findFirst({
          where: { teamId: tId, userId: uid },
        });
        if (!member) throw new ForbiddenException("bukan anggota tim ini");
        if (!member.is_leader) {
          if (uId && uId !== uid)
            throw new ForbiddenException("bukan ketua tim");
          if (!uId) uId = uid;
        }
      } else {
        uId = uid;
      }
    }

    return this.monitoringService.mingguan(minggu, tId, uId);
  }

  @Get("bulanan")
  async bulanan(
    @Query("bulan") bulan?: string,
    @Req() req?: Request,
    @Query("teamId") teamId?: string,
    @Query("userId") userId?: string,
  ) {
    if (!bulan) {
      throw new BadRequestException("query 'bulan' diperlukan");
    }
    const user = req?.user as any;
    const role = user?.role;
    let tId = teamId ? parseInt(teamId, 10) : undefined;
    let uId = userId ? parseInt(userId, 10) : undefined;

    if (role !== "admin" && role !== "pimpinan") {
      const uid = user.userId;
      if (tId) {
        const member = await this.prisma.member.findFirst({
          where: { teamId: tId, userId: uid },
        });
        if (!member) throw new ForbiddenException("bukan anggota tim ini");
        if (!member.is_leader) {
          if (uId && uId !== uid)
            throw new ForbiddenException("bukan ketua tim");
          if (!uId) uId = uid;
        }
      } else {
        uId = uid;
      }
    }

    return this.monitoringService.bulanan(bulan, tId, uId);
  }
}
