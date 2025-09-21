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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringController = void 0;
const common_1 = require("@nestjs/common");
const monitoring_service_1 = require("./monitoring.service");
const jwt_auth_guard_1 = require("../../shared/guards/jwt-auth.guard");
const roles_guard_1 = require("../../shared/guards/roles.guard");
const monitoring_access_service_1 = require("./services/monitoring-access.service");
const swagger_1 = require("@nestjs/swagger");
let MonitoringController = class MonitoringController {
    constructor(monitoringService, access) {
        this.monitoringService = monitoringService;
        this.access = access;
    }
    async lastUpdate() {
        const date = await this.monitoringService.lastUpdate();
        return {
            lastUpdate: date ? date.toISOString() : null,
            fetchedAt: new Date().toISOString(),
        };
    }
    async harian(tanggal, req, teamId, userId) {
        if (!tanggal) {
            throw new common_1.BadRequestException("query 'tanggal' diperlukan");
        }
        const user = req?.user;
        const role = user?.role;
        const resolvedUserId = user
            ? await this.access.resolveUserScope({
                role,
                currentUserId: user.userId,
                teamId,
                requestedUserId: userId,
            })
            : userId;
        return this.monitoringService.harian(tanggal, teamId, resolvedUserId);
    }
    async harianAll(tanggal, teamId) {
        if (!tanggal) {
            throw new common_1.BadRequestException("query 'tanggal' diperlukan");
        }
        return this.monitoringService.harianAll(tanggal, teamId);
    }
    async harianBulan(tanggal, teamId) {
        if (!tanggal) {
            throw new common_1.BadRequestException("query 'tanggal' diperlukan");
        }
        return this.monitoringService.harianBulan(tanggal, teamId);
    }
    async mingguan(minggu, req, teamId, userId) {
        if (!minggu) {
            throw new common_1.BadRequestException("query 'minggu' diperlukan");
        }
        const user = req?.user;
        const role = user?.role;
        const resolvedUserId = user
            ? await this.access.resolveUserScope({
                role,
                currentUserId: user.userId,
                teamId,
                requestedUserId: userId,
            })
            : userId;
        return this.monitoringService.mingguan(minggu, teamId, resolvedUserId);
    }
    async mingguanAll(minggu, teamId) {
        if (!minggu) {
            throw new common_1.BadRequestException("query 'minggu' diperlukan");
        }
        return this.monitoringService.mingguanAll(minggu, teamId);
    }
    async penugasanMinggu(minggu, req, teamId, userId) {
        if (!minggu) {
            throw new common_1.BadRequestException("query 'minggu' diperlukan");
        }
        const user = req?.user;
        const role = user?.role;
        const resolvedUserId = user
            ? await this.access.resolveUserScope({
                role,
                currentUserId: user.userId,
                teamId,
                requestedUserId: userId,
            })
            : userId;
        return this.monitoringService.penugasanMinggu(minggu, teamId, resolvedUserId);
    }
    async mingguanBulan(tanggal, teamId) {
        if (!tanggal) {
            throw new common_1.BadRequestException("query 'tanggal' diperlukan");
        }
        return this.monitoringService.mingguanBulan(tanggal, teamId);
    }
    async bulanan(year, req, teamId, userId) {
        if (!year) {
            throw new common_1.BadRequestException("query 'year' diperlukan");
        }
        const user = req?.user;
        const role = user?.role;
        const resolvedUserId = user
            ? await this.access.resolveUserScope({
                role,
                currentUserId: user.userId,
                teamId,
                requestedUserId: userId,
            })
            : userId;
        return this.monitoringService.bulanan(year, teamId, resolvedUserId);
    }
    async bulananAll(year, teamId, bulan) {
        if (!year) {
            throw new common_1.BadRequestException("query 'year' diperlukan");
        }
        return this.monitoringService.bulananAll(year, teamId, bulan);
    }
    async bulananMatrix(year, teamId) {
        if (!year) {
            throw new common_1.BadRequestException("query 'year' diperlukan");
        }
        return this.monitoringService.bulananMatrix(year, teamId);
    }
    async laporanTerlambat(teamId) {
        return this.monitoringService.laporanTerlambat(teamId);
    }
    async holidays() {
        return this.monitoringService.getHolidays();
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Get)('last-update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "lastUpdate", null);
__decorate([
    (0, common_1.Get)("harian"),
    __param(0, (0, common_1.Query)("tanggal")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)("teamId")),
    __param(3, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "harian", null);
__decorate([
    (0, common_1.Get)("harian/all"),
    __param(0, (0, common_1.Query)("tanggal")),
    __param(1, (0, common_1.Query)("teamId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "harianAll", null);
__decorate([
    (0, common_1.Get)("harian/bulan"),
    __param(0, (0, common_1.Query)("tanggal")),
    __param(1, (0, common_1.Query)("teamId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "harianBulan", null);
__decorate([
    (0, common_1.Get)("mingguan"),
    __param(0, (0, common_1.Query)("minggu")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)("teamId")),
    __param(3, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "mingguan", null);
__decorate([
    (0, common_1.Get)("mingguan/all"),
    __param(0, (0, common_1.Query)("minggu")),
    __param(1, (0, common_1.Query)("teamId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "mingguanAll", null);
__decorate([
    (0, common_1.Get)("penugasan/minggu"),
    __param(0, (0, common_1.Query)("minggu")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)("teamId")),
    __param(3, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "penugasanMinggu", null);
__decorate([
    (0, common_1.Get)("mingguan/bulan"),
    __param(0, (0, common_1.Query)("tanggal")),
    __param(1, (0, common_1.Query)("teamId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "mingguanBulan", null);
__decorate([
    (0, common_1.Get)("bulanan"),
    __param(0, (0, common_1.Query)("year")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)("teamId")),
    __param(3, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "bulanan", null);
__decorate([
    (0, common_1.Get)("bulanan/all"),
    __param(0, (0, common_1.Query)("year")),
    __param(1, (0, common_1.Query)("teamId")),
    __param(2, (0, common_1.Query)("bulan")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "bulananAll", null);
__decorate([
    (0, common_1.Get)("bulanan/matrix"),
    __param(0, (0, common_1.Query)("year")),
    __param(1, (0, common_1.Query)("teamId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "bulananMatrix", null);
__decorate([
    (0, common_1.Get)("laporan/terlambat"),
    __param(0, (0, common_1.Query)("teamId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "laporanTerlambat", null);
__decorate([
    (0, common_1.Get)("holidays"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "holidays", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, swagger_1.ApiTags)("monitoring"),
    (0, common_1.Controller)("monitoring"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService,
        monitoring_access_service_1.MonitoringAccessService])
], MonitoringController);
