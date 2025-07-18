import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TeamsModule } from "./teams/teams.module";
import { KegiatanModule } from "./kegiatan/kegiatan.module";
import { LaporanModule } from "./laporan/laporan.module";
import { MonitoringModule } from "./monitoring/monitoring.module";
import { RolesModule } from "./roles/roles.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TeamsModule,
    KegiatanModule,
    LaporanModule,
    MonitoringModule,
    RolesModule,
    NotificationsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
