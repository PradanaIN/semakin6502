import { Controller, Post, Get, Body, Query, UseGuards } from "@nestjs/common";
import { LaporanService } from "./laporan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { SubmitLaporanDto } from "./dto/submit-laporan.dto";

@Controller("laporan-harian")
@UseGuards(JwtAuthGuard)
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  @Post()
  submit(@Body() body: SubmitLaporanDto) {
    return this.laporanService.submit(body);
  }

  @Get()
  getByTanggal(@Query("tanggal") tanggal: string) {
    return this.laporanService.getByTanggal(tanggal);
  }
}
