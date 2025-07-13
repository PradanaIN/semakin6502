import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import { Request } from "express";
import { LaporanService } from "./laporan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { SubmitLaporanDto } from "./dto/submit-laporan.dto";

@Controller("laporan-harian")
@UseGuards(JwtAuthGuard)
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  @Post()
  submit(@Body() body: SubmitLaporanDto, @Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.laporanService.submit({ ...body, pegawaiId: userId });
  }

  @Get()
  getByTanggal(@Query("tanggal") tanggal: string) {
    return this.laporanService.getByTanggal(tanggal);
  }

  @Get('penugasan/:id')
  getByPenugasan(@Param('id', ParseIntPipe) id: number) {
    return this.laporanService.getByPenugasan(id);
  }
}
