import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  Param,
  Put,
  Delete,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import { LaporanService } from "./laporan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.decorator";
import { ROLES } from "../common/roles.constants";
import { SubmitLaporanDto } from "./dto/submit-laporan.dto";
import { UpdateLaporanDto } from "./dto/update-laporan.dto";
import { AuthRequestUser } from "../common/auth-request-user.interface";

@Controller("laporan-harian")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  @Get("all")
  @Roles(ROLES.ADMIN)
  getAll() {
    return this.laporanService.getAll();
  }

  @Post()
  submit(@Body() body: SubmitLaporanDto, @Req() req: Request) {
    console.log('Payload:', body);
    const u = req.user as AuthRequestUser;
    return this.laporanService.submit(body, u.userId, u.role);
  }

  @Get()
  getByTanggal(@Query("tanggal") tanggal: string) {
    return this.laporanService.getByTanggal(tanggal);
  }

  @Get("penugasan/:id")
  getByPenugasan(@Param("id") id: string) {
    return this.laporanService.getByPenugasan(id);
  }

  @Get("mine")
  myReports(@Req() req: Request) {
    const userId = (req.user as AuthRequestUser).userId;
    return this.laporanService.getByUser(userId);
  }

  @Get("mine/filter")
  myReportsFiltered(
    @Req() req: Request,
    @Query("bulan") bulan?: string,
    @Query("minggu") minggu?: string,
    @Query("tambahan") tambahan?: string
  ) {
    const userId = (req.user as AuthRequestUser).userId;
    const week = minggu ? parseInt(minggu, 10) : undefined;
    return this.laporanService.getByMonthWeek(
      userId,
      bulan,
      week,
      tambahan === "true"
    );
  }

  @Get("mine/export")
  async export(
    @Req() req: Request,
    @Res() res: Response,
    @Query("format") format = "xlsx",
    @Query("bulan") bulan?: string,
    @Query("minggu") minggu?: string,
    @Query("tambahan") tambahan?: string,
    @Query("tanggal") tanggal?: string
  ) {
    const userId = (req.user as AuthRequestUser).userId;
    const week = minggu ? parseInt(minggu, 10) : undefined;
    const { buffer, fileName } = await this.laporanService.export(
      userId,
      format,
      bulan,
      week,
      tambahan === "true",
      tanggal
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(buffer);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() body: UpdateLaporanDto,
    @Req() req: Request
  ) {
    const u = req.user as AuthRequestUser;
    return this.laporanService.update(id, body, u.userId, u.role);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: Request) {
    const u = req.user as AuthRequestUser;
    return this.laporanService.remove(id, u.userId, u.role);
  }
}
