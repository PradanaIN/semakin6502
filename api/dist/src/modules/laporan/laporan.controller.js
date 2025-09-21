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
exports.LaporanController = void 0;
const common_1 = require("@nestjs/common");
const laporan_service_1 = require("./laporan.service");
const jwt_auth_guard_1 = require("../../shared/guards/jwt-auth.guard");
const roles_guard_1 = require("../../shared/guards/roles.guard");
const roles_decorator_1 = require("../../shared/guards/roles.decorator");
const roles_constants_1 = require("../../shared/constants/roles.constants");
const submit_laporan_dto_1 = require("./dto/submit-laporan.dto");
const update_laporan_dto_1 = require("./dto/update-laporan.dto");
const swagger_1 = require("@nestjs/swagger");
let LaporanController = class LaporanController {
    constructor(laporanService) {
        this.laporanService = laporanService;
    }
    getAll(skip, take) {
        const s = skip ? parseInt(skip, 10) : undefined;
        const t = take ? parseInt(take, 10) : undefined;
        return this.laporanService.getAll(s, t);
    }
    submit(body, req) {
        console.log('Payload:', body);
        const u = req.user;
        return this.laporanService.submit(body, u.userId, u.role);
    }
    getByTanggal(tanggal) {
        return this.laporanService.getByTanggal(tanggal);
    }
    getByPenugasan(id) {
        return this.laporanService.getByPenugasan(id);
    }
    getByTambahan(id) {
        return this.laporanService.getByTambahan(id);
    }
    myReports(req) {
        const userId = req.user.userId;
        return this.laporanService.getByUser(userId);
    }
    myReportsFiltered(req, bulan, minggu, tambahan) {
        const userId = req.user.userId;
        const week = minggu ? parseInt(minggu, 10) : undefined;
        return this.laporanService.getByMonthWeek(userId, bulan, week, tambahan === "true");
    }
    async export(req, res, format = "xlsx", bulan, minggu, tambahan, tanggal) {
        const userId = req.user.userId;
        const week = minggu ? parseInt(minggu, 10) : undefined;
        const { buffer, fileName } = await this.laporanService.export(userId, format, bulan, week, tambahan === "true", tanggal);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
        res.send(buffer);
    }
    update(id, body, req) {
        const u = req.user;
        return this.laporanService.update(id, body, u.userId, u.role);
    }
    remove(id, req) {
        const u = req.user;
        return this.laporanService.remove(id, u.userId, u.role);
    }
};
exports.LaporanController = LaporanController;
__decorate([
    (0, common_1.Get)("all"),
    (0, roles_decorator_1.Roles)(roles_constants_1.ROLES.ADMIN),
    (0, swagger_1.ApiQuery)({ name: "skip", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "take", required: false, type: Number }),
    __param(0, (0, common_1.Query)("skip")),
    __param(1, (0, common_1.Query)("take")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_laporan_dto_1.SubmitLaporanDto, Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("tanggal")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "getByTanggal", null);
__decorate([
    (0, common_1.Get)("penugasan/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "getByPenugasan", null);
__decorate([
    (0, common_1.Get)("tambahan/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "getByTambahan", null);
__decorate([
    (0, common_1.Get)("mine"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "myReports", null);
__decorate([
    (0, common_1.Get)("mine/filter"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("bulan")),
    __param(2, (0, common_1.Query)("minggu")),
    __param(3, (0, common_1.Query)("tambahan")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "myReportsFiltered", null);
__decorate([
    (0, common_1.Get)("mine/export"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)("format")),
    __param(3, (0, common_1.Query)("bulan")),
    __param(4, (0, common_1.Query)("minggu")),
    __param(5, (0, common_1.Query)("tambahan")),
    __param(6, (0, common_1.Query)("tanggal")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "export", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_laporan_dto_1.UpdateLaporanDto, Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "remove", null);
exports.LaporanController = LaporanController = __decorate([
    (0, swagger_1.ApiTags)("laporan-harian"),
    (0, common_1.Controller)("laporan-harian"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [laporan_service_1.LaporanService])
], LaporanController);
