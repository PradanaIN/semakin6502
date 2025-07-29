import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule, minutes } from "@nestjs/throttler";
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

const ttl = process.env.THROTTLE_TTL
  ? parseInt(process.env.THROTTLE_TTL, 10)
  : minutes(15);

const limit = process.env.THROTTLE_LIMIT
  ? parseInt(process.env.THROTTLE_LIMIT, 10)
  : 100;

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl, limit }]),
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
