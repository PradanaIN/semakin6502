import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { MonitoringService } from "./monitoring.service";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";
import { MonitoringAccessService } from "./services/monitoring-access.service";
import { Request } from "express";
import { ROLES } from "@shared/constants/roles.constants";
import { AuthRequestUser } from "@shared/interfaces/auth-request-user.interface";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("monitoring")
@Controller("monitoring")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly access: MonitoringAccessService,
  ) {}

  @Get('last-update')
  async lastUpdate() {
    const date = await this.monitoringService.lastUpdate();
    return {
      lastUpdate: date ? date.toISOString() : null,
      fetchedAt: new Date().toISOString(),
    };
  }

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
    const user = req?.user as AuthRequestUser;
    const role = user?.role;
    const resolvedUserId =
      user
        ? await this.access.resolveUserScope({
            role,
            currentUserId: user.userId,
            teamId,
            requestedUserId: userId,
          })
        : userId;

    return this.monitoringService.harian(tanggal, teamId, resolvedUserId);
  }

  @Get("harian/all")
  async harianAll(
    @Query("tanggal") tanggal?: string,
    @Query("teamId") teamId?: string,
  ) {
    if (!tanggal) {
      throw new BadRequestException("query 'tanggal' diperlukan");
    }
    return this.monitoringService.harianAll(tanggal, teamId);
  }

  @Get("harian/bulan")
  async harianBulan(
    @Query("tanggal") tanggal?: string,
    @Query("teamId") teamId?: string,
  ) {
    if (!tanggal) {
      throw new BadRequestException("query 'tanggal' diperlukan");
    }
    return this.monitoringService.harianBulan(tanggal, teamId);
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
    const user = req?.user as AuthRequestUser;
    const role = user?.role;
    const resolvedUserId =
      user
        ? await this.access.resolveUserScope({
            role,
            currentUserId: user.userId,
            teamId,
            requestedUserId: userId,
          })
        : userId;

    return this.monitoringService.mingguan(minggu, teamId, resolvedUserId);
  }

  @Get("mingguan/all")
  async mingguanAll(
    @Query("minggu") minggu?: string,
    @Query("teamId") teamId?: string,
  ) {
    if (!minggu) {
      throw new BadRequestException("query 'minggu' diperlukan");
    }
    return this.monitoringService.mingguanAll(minggu, teamId);
  }

  @Get("penugasan/minggu")
  async penugasanMinggu(
    @Query("minggu") minggu?: string,
    @Req() req?: Request,
    @Query("teamId") teamId?: string,
    @Query("userId") userId?: string,
  ) {
    if (!minggu) {
      throw new BadRequestException("query 'minggu' diperlukan");
    }
    const user = req?.user as AuthRequestUser;
    const role = user?.role;
    const resolvedUserId =
      user
        ? await this.access.resolveUserScope({
            role,
            currentUserId: user.userId,
            teamId,
            requestedUserId: userId,
          })
        : userId;

    return this.monitoringService.penugasanMinggu(minggu, teamId, resolvedUserId);
  }

  @Get("mingguan/bulan")
  async mingguanBulan(
    @Query("tanggal") tanggal?: string,
    @Query("teamId") teamId?: string,
  ) {
    if (!tanggal) {
      throw new BadRequestException("query 'tanggal' diperlukan");
    }
    return this.monitoringService.mingguanBulan(tanggal, teamId);
  }

  @Get("bulanan")
  async bulanan(
    @Query("year") year?: string,
    @Req() req?: Request,
    @Query("teamId") teamId?: string,
    @Query("userId") userId?: string,
  ) {
    if (!year) {
      throw new BadRequestException("query 'year' diperlukan");
    }
    const user = req?.user as AuthRequestUser;
    const role = user?.role;
    const resolvedUserId =
      user
        ? await this.access.resolveUserScope({
            role,
            currentUserId: user.userId,
            teamId,
            requestedUserId: userId,
          })
        : userId;

    return this.monitoringService.bulanan(year, teamId, resolvedUserId);
  }

  @Get("bulanan/all")
  async bulananAll(
    @Query("year") year?: string,
    @Query("teamId") teamId?: string,
    @Query("bulan") bulan?: string,
  ) {
    if (!year) {
      throw new BadRequestException("query 'year' diperlukan");
    }
    return this.monitoringService.bulananAll(year, teamId, bulan);
  }

  @Get("bulanan/matrix")
  async bulananMatrix(
    @Query("year") year?: string,
    @Query("teamId") teamId?: string,
  ) {
    if (!year) {
      throw new BadRequestException("query 'year' diperlukan");
    }
    return this.monitoringService.bulananMatrix(year, teamId);
  }

  @Get("laporan/terlambat")
  async laporanTerlambat(
    @Query("teamId") teamId?: string,
  ) {
    return this.monitoringService.laporanTerlambat(teamId);
  }

  @Get("holidays")
  async holidays() {
    return this.monitoringService.getHolidays();
  }
}
