import { Module, ExecutionContext } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule, minutes } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-yet";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Joi from "joi";
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
    ConfigModule.forRoot({
      isGlobal: true,
        validationSchema: Joi.object({
          THROTTLE_TTL: Joi.number().default(minutes(15)),
          THROTTLE_LIMIT: Joi.number().default(1000),
          REDIS_URL: Joi.string().uri().optional(),
          COOKIE_DOMAIN: Joi.string().allow(""),
          COOKIE_SAMESITE: Joi.string().valid("lax", "strict", "none"),
          NODE_ENV: Joi.string(),
          CORS_ORIGIN: Joi.string(),
          WEB_URL: Joi.string().uri().allow("").optional(),
          FONNTE_TOKEN: Joi.string(),
          WHATSAPP_TOKEN: Joi.string(),
          WHATSAPP_API_URL: Joi.string().uri().required(),
          PORT: Joi.number(),
          PHONE_VALIDATION_ENABLED: Joi.boolean().default(true),
        }).or("FONNTE_TOKEN", "WHATSAPP_TOKEN"),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get<string>("REDIS_URL");
        if (redisUrl) {
          return {
            store: await redisStore({ url: redisUrl }),
            ttl: 0,
          };
        }
        return { ttl: 0 };
      },
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const ttl = config.get<number>("THROTTLE_TTL") ?? minutes(15);
        const limit = config.get<number>("THROTTLE_LIMIT") ?? 1000;
        return {
          throttlers: [{ ttl, limit }],
          skipIf: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            return req.path.startsWith("/health");
          },
        };
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
