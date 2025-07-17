import { Module } from "@nestjs/common";
import { LaporanController } from "./laporan.controller";
import { LaporanService } from "./laporan.service";
import { TambahanController } from "./tugas-tambahan.controller";
import { TambahanService } from "./tugas-tambahan.service";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [LaporanController, TambahanController],
  providers: [PrismaService, LaporanService, TambahanService],
})
export class LaporanModule {}
