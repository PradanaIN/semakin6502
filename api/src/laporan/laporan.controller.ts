import { Controller, Post, Get, Body, Query, UseGuards } from "@nestjs/common";
import { LaporanService } from "./laporan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("laporan-harian")
@UseGuards(JwtAuthGuard)
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  @Post()
  submit(@Body() body: any) {
    return this.laporanService.submit(body);
  }

  @Get()
  getByTanggal(@Query("tanggal") tanggal: string) {
    return this.laporanService.getByTanggal(tanggal);
  }
}
