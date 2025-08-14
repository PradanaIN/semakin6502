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
import { ROLES } from "../common/roles.constants";
import { AuthRequestUser } from "../common/auth-request-user.interface";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("monitoring")
@Controller("monitoring")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('last-update')
  async lastUpdate() {
    const date = await this.monitoringService.lastUpdate();
    return { lastUpdate: date ? date.toISOString() : null };
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
    const tId = teamId;
    let uId = userId;

    if (role !== ROLES.ADMIN && role !== ROLES.PIMPINAN) {
      const uid = user.userId;
      if (tId) {
        const member = await this.prisma.member.findFirst({
          where: { teamId: tId, userId: uid },
        });
        if (!member) throw new ForbiddenException("bukan anggota tim ini");
        if (!member.isLeader) {
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
    const tId = teamId;
    let uId = userId;

    if (role !== ROLES.ADMIN && role !== ROLES.PIMPINAN) {
      const uid = user.userId;
      if (tId) {
        const member = await this.prisma.member.findFirst({
          where: { teamId: tId, userId: uid },
        });
        if (!member) throw new ForbiddenException("bukan anggota tim ini");
        if (!member.isLeader) {
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
    const tId = teamId;
    let uId = userId;

    if (role !== ROLES.ADMIN && role !== ROLES.PIMPINAN) {
      const uid = user.userId;
      if (tId) {
        const member = await this.prisma.member.findFirst({
          where: { teamId: tId, userId: uid },
        });
        if (!member) throw new ForbiddenException("bukan anggota tim ini");
        if (!member.isLeader) {
          if (uId && uId !== uid)
            throw new ForbiddenException("bukan ketua tim");
          if (!uId) uId = uid;
        }
      } else {
        uId = uid;
      }
    }

    return this.monitoringService.penugasanMinggu(minggu, tId, uId);
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
    const tId = teamId;
    let uId = userId;

    if (role !== ROLES.ADMIN && role !== ROLES.PIMPINAN) {
      const uid = user.userId;
      if (tId) {
        const member = await this.prisma.member.findFirst({
          where: { teamId: tId, userId: uid },
        });
        if (!member) throw new ForbiddenException("bukan anggota tim ini");
        if (!member.isLeader) {
          if (uId && uId !== uid)
            throw new ForbiddenException("bukan ketua tim");
          if (!uId) uId = uid;
        }
      } else {
        uId = uid;
      }
    }

    return this.monitoringService.bulanan(year, tId, uId);
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
}
