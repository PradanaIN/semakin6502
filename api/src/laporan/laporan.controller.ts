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
  Put,
  Delete,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import { LaporanService } from "./laporan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { SubmitLaporanDto } from "./dto/submit-laporan.dto";
import { UpdateLaporanDto } from "./dto/update-laporan.dto";

@Controller("laporan-harian")
@UseGuards(JwtAuthGuard)
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  @Post()
  submit(@Body() body: SubmitLaporanDto, @Req() req: Request) {
    const u = req.user as any;
    return this.laporanService.submit(body, u.userId, u.role);
  }

  @Get()
  getByTanggal(@Query("tanggal") tanggal: string) {
    return this.laporanService.getByTanggal(tanggal);
  }

  @Get("penugasan/:id")
  getByPenugasan(@Param("id", ParseIntPipe) id: number) {
    return this.laporanService.getByPenugasan(id);
  }

  @Get("mine")
  myReports(@Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.laporanService.getByUser(userId);
  }

  @Get("mine/export")
  async export(
    @Req() req: Request,
    @Res() res: Response,
    @Query("format") format = "xlsx",
  ) {
    const userId = (req.user as any).userId;
    const buf = await this.laporanService.export(userId, format);
    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=laporan.pdf");
    } else {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=laporan.xlsx",
      );
    }
    res.send(buf);
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateLaporanDto,
    @Req() req: Request,
  ) {
    const u = req.user as any;
    return this.laporanService.update(id, body, u.userId, u.role);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    const u = req.user as any;
    return this.laporanService.remove(id, u.userId, u.role);
  }
}
