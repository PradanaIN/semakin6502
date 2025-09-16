import { Module } from "@nestjs/common";
import { MasterKegiatanController } from "./master-kegiatan.controller";
import { MasterKegiatanService } from "./master-kegiatan.service";
import { PenugasanController } from "./penugasan.controller";
import { PenugasanService } from "./penugasan.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [MasterKegiatanController, PenugasanController],
  providers: [MasterKegiatanService, PenugasanService],
})
export class KegiatanModule {}
