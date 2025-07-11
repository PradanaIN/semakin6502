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
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/guards/roles.decorator");
let MonitoringController = class MonitoringController {
    constructor(monitoringService) {
        this.monitoringService = monitoringService;
    }
    harian(tanggal) {
        return this.monitoringService.harian(tanggal);
    }
    mingguan(minggu) {
        return this.monitoringService.mingguan(minggu);
    }
    bulanan(bulan) {
        return this.monitoringService.bulanan(bulan);
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Get)("harian"),
    (0, roles_decorator_1.Roles)("ketua", "pimpinan", "admin"),
    __param(0, (0, common_1.Query)("tanggal")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "harian", null);
__decorate([
    (0, common_1.Get)("mingguan"),
    (0, roles_decorator_1.Roles)("ketua", "pimpinan", "admin"),
    __param(0, (0, common_1.Query)("minggu")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "mingguan", null);
__decorate([
    (0, common_1.Get)("bulanan"),
    (0, roles_decorator_1.Roles)("ketua", "pimpinan", "admin"),
    __param(0, (0, common_1.Query)("bulan")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "bulanan", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, common_1.Controller)("monitoring"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
], MonitoringController);
