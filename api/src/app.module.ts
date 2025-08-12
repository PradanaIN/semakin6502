import { Module, ExecutionContext } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule, minutes } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";
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
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().uri().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default("1d"),
        NODE_ENV: Joi.string()
          .valid("development", "production", "test")
          .default("development"),
        PORT: Joi.number().default(3000),
        CORS_ORIGIN: Joi.string().optional(),
        THROTTLE_TTL: Joi.number().optional(),
        THROTTLE_LIMIT: Joi.number().optional(),
        COOKIE_DOMAIN: Joi.string().optional(),
        COOKIE_SAMESITE: Joi.string()
          .valid("strict", "lax", "none")
          .optional(),
      }),
    }),
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
