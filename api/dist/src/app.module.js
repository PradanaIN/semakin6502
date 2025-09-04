"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const config_1 = require("@nestjs/config");
const joi_1 = __importDefault(require("joi"));
const prisma_service_1 = require("./prisma.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const teams_module_1 = require("./teams/teams.module");
const kegiatan_module_1 = require("./kegiatan/kegiatan.module");
const laporan_module_1 = require("./laporan/laporan.module");
const monitoring_module_1 = require("./monitoring/monitoring.module");
const roles_module_1 = require("./roles/roles.module");
const notifications_module_1 = require("./notifications/notifications.module");
const health_controller_1 = require("./health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: joi_1.default.object({
                    THROTTLE_TTL: joi_1.default.number().default((0, throttler_1.minutes)(15)),
                    THROTTLE_LIMIT: joi_1.default.number().default(1000),
                    REDIS_URL: joi_1.default.string().uri().optional(),
                    COOKIE_DOMAIN: joi_1.default.string().allow(""),
                    COOKIE_SAMESITE: joi_1.default.string().valid("lax", "strict", "none"),
                    NODE_ENV: joi_1.default.string(),
                    CORS_ORIGIN: joi_1.default.string(),
                    WEB_URL: joi_1.default.string().uri().required(),
                    FONNTE_TOKEN: joi_1.default.string(),
                    WHATSAPP_TOKEN: joi_1.default.string(),
                    WHATSAPP_API_URL: joi_1.default.string().uri().required(),
                    PORT: joi_1.default.number(),
                    PHONE_VALIDATION_ENABLED: joi_1.default.boolean().default(true),
                }).or("FONNTE_TOKEN", "WHATSAPP_TOKEN"),
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                inject: [config_1.ConfigService],
                useFactory: async (config) => {
                    const redisUrl = config.get("REDIS_URL");
                    if (redisUrl) {
                        return {
                            store: await (0, cache_manager_redis_yet_1.redisStore)({ url: redisUrl }),
                            ttl: 0,
                        };
                    }
                    return { ttl: 0 };
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const ttl = config.get("THROTTLE_TTL") ?? (0, throttler_1.minutes)(15);
                    const limit = config.get("THROTTLE_LIMIT") ?? 1000;
                    return {
                        throttlers: [{ ttl, limit }],
                        skipIf: (context) => {
                            const req = context.switchToHttp().getRequest();
                            return req.path.startsWith("/health");
                        },
                    };
                },
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            teams_module_1.TeamsModule,
            kegiatan_module_1.KegiatanModule,
            laporan_module_1.LaporanModule,
            monitoring_module_1.MonitoringModule,
            roles_module_1.RolesModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [
            prisma_service_1.PrismaService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
        exports: [prisma_service_1.PrismaService],
    })
], AppModule);
