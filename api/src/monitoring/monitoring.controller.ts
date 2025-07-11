import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { MonitoringService } from "./monitoring.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.decorator";
import { Request } from "express";

@Controller("monitoring")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get("harian")
  @Roles("ketua", "pimpinan", "admin", "anggota")
  harian(
    @Query("tanggal") tanggal?: string,
    @Req() req?: Request,
    @Query("teamId") teamId?: string,
    @Query("userId") userId?: string,
  ) {
    if (!tanggal) {
      throw new BadRequestException("query 'tanggal' diperlukan");
    }
    const role = (req?.user as any)?.role;
    let tId = teamId ? parseInt(teamId, 10) : undefined;
    let uId = userId ? parseInt(userId, 10) : undefined;
    if (role === "anggota") uId = (req?.user as any).userId;
    return this.monitoringService.harian(tanggal, tId, uId);
  }

  @Get("mingguan")
  @Roles("ketua", "pimpinan", "admin", "anggota")
  mingguan(
    @Query("minggu") minggu?: string,
    @Req() req?: Request,
    @Query("teamId") teamId?: string,
    @Query("userId") userId?: string,
  ) {
    if (!minggu) {
      throw new BadRequestException("query 'minggu' diperlukan");
    }
    const role = (req?.user as any)?.role;
    let tId = teamId ? parseInt(teamId, 10) : undefined;
    let uId = userId ? parseInt(userId, 10) : undefined;
    if (role === "anggota") uId = (req?.user as any).userId;
    return this.monitoringService.mingguan(minggu, tId, uId);
  }

  @Get("bulanan")
  @Roles("ketua", "pimpinan", "admin", "anggota")
  bulanan(
    @Query("bulan") bulan?: string,
    @Req() req?: Request,
    @Query("teamId") teamId?: string,
    @Query("userId") userId?: string,
  ) {
    if (!bulan) {
      throw new BadRequestException("query 'bulan' diperlukan");
    }
    const role = (req?.user as any)?.role;
    let tId = teamId ? parseInt(teamId, 10) : undefined;
    let uId = userId ? parseInt(userId, 10) : undefined;
    if (role === "anggota") uId = (req?.user as any).userId;
    return this.monitoringService.bulanan(bulan, tId, uId);
  }
}
