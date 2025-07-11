import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { MonitoringService } from "./monitoring.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.decorator";

@Controller("monitoring")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get("harian")
  @Roles("ketua", "pimpinan", "admin")
  harian(@Query("tanggal") tanggal?: string) {
    if (!tanggal) {
      throw new BadRequestException("query 'tanggal' diperlukan");
    }
    return this.monitoringService.harian(tanggal);
  }

  @Get("mingguan")
  @Roles("ketua", "pimpinan", "admin")
  mingguan(@Query("minggu") minggu?: string) {
    if (!minggu) {
      throw new BadRequestException("query 'minggu' diperlukan");
    }
    return this.monitoringService.mingguan(minggu);
  }

  @Get("bulanan")
  @Roles("ketua", "pimpinan", "admin")
  bulanan(@Query("bulan") bulan?: string) {
    if (!bulan) {
      throw new BadRequestException("query 'bulan' diperlukan");
    }
    return this.monitoringService.bulanan(bulan);
  }
}
