"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        const databaseUrl = process.env.DATABASE_URL ?? PrismaService_1.composeDatabaseUrl();
        if (!process.env.DATABASE_URL) {
            process.env.DATABASE_URL = databaseUrl;
        }
        super({
            datasources: {
                db: {
                    url: databaseUrl,
                },
            },
        });
    }
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
    static composeDatabaseUrl() {
        const host = process.env.DATABASE_HOST;
        const port = process.env.DATABASE_PORT ?? "3306";
        const user = process.env.DATABASE_USER;
        const database = process.env.DATABASE_NAME;
        if (!host || !user || !database) {
            throw new Error("DATABASE_URL is not set and database connection pieces are incomplete.");
        }
        const rawPassword = process.env.DATABASE_PASSWORD ?? "";
        const passwordSegment = rawPassword
            ? `:${encodeURIComponent(rawPassword)}`
            : "";
        const portSegment = port ? `:${port}` : "";
        return `mysql://${user}${passwordSegment}@${host}${portSegment}/${database}`;
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
