import { Module } from "@nestjs/common";
import { LaporanController } from "./laporan.controller";
import { LaporanService } from "./laporan.service";
import { TambahanController } from "./tugas-tambahan.controller";
import { TambahanService } from "./tugas-tambahan.service";
import { PrismaService } from "../prisma.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [LaporanController, TambahanController],
  providers: [PrismaService, LaporanService, TambahanService],
  exports: [TambahanService],
})
export class LaporanModule {}
