import { Module, ExecutionContext } from "@nestjs/common";
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

const ttl = process.env.THROTTLE_TTL
  ? parseInt(process.env.THROTTLE_TTL, 10)
  : minutes(15);

const limit = process.env.THROTTLE_LIMIT
  ? parseInt(process.env.THROTTLE_LIMIT, 10)
  : 1000;

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl, limit }],
      skipIf: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        return req.path.startsWith("/health");
      },
    }),
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
