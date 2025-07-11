import { Module } from "@nestjs/common";
import { MasterKegiatanController } from "./master-kegiatan.controller";
import { MasterKegiatanService } from "./master-kegiatan.service";
import { PenugasanController } from "./penugasan.controller";
import { PenugasanService } from "./penugasan.service";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [MasterKegiatanController, PenugasanController],
  providers: [PrismaService, MasterKegiatanService, PenugasanService],
})
export class KegiatanModule {}
