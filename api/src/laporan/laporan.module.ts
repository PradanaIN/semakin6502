import { Module } from "@nestjs/common";
import { LaporanController } from "./laporan.controller";
import { LaporanService } from "./laporan.service";
import { TambahanController } from "./kegiatan-tambahan.controller";
import { TambahanService } from "./kegiatan-tambahan.service";

@Module({
  controllers: [LaporanController, TambahanController],
  providers: [LaporanService, TambahanService],
})
export class LaporanModule {}
