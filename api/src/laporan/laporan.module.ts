import { Module } from "@nestjs/common";
import { LaporanController } from "./laporan.controller";
import { LaporanService } from "./laporan.service";
import { TambahanController } from "./kegiatan-tambahan.controller";
import { TambahanService } from "./kegiatan-tambahan.service";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [LaporanController, TambahanController],
  providers: [PrismaService, LaporanService, TambahanService],
})
export class LaporanModule {}
