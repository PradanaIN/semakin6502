import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule, minutes } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaService } from "./prisma.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TeamsModule } from "./teams/teams.module";
import { KegiatanModule } from "./kegiatan/kegiatan.module";
import { LaporanModule } from "./laporan/laporan.module";
import { MonitoringModule } from "./monitoring/monitoring.module";
import { RolesModule } from "./roles/roles.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: minutes(15), limit: 100 }]),
    ScheduleModule.forRoot(),
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
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [PrismaService],
})
export class AppModule {}
