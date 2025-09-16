import { Module } from "@nestjs/common";
import { CoreModule } from "@core/core.module";
import { AuthModule } from "@modules/auth/auth.module";
import { UsersModule } from "@modules/users/users.module";
import { TeamsModule } from "@modules/teams/teams.module";
import { KegiatanModule } from "@modules/kegiatan/kegiatan.module";
import { LaporanModule } from "@modules/laporan/laporan.module";
import { MonitoringModule } from "@modules/monitoring/monitoring.module";
import { RolesModule } from "@modules/roles/roles.module";
import { NotificationsModule } from "@modules/notifications/notifications.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UsersModule,
    TeamsModule,
    KegiatanModule,
    LaporanModule,
    MonitoringModule,
    RolesModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
