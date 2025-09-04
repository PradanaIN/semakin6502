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
exports.PenugasanController = void 0;
const common_1 = require("@nestjs/common");
const penugasan_service_1 = require("./penugasan.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const assign_penugasan_dto_1 = require("./dto/assign-penugasan.dto");
const assign_penugasan_bulk_dto_1 = require("./dto/assign-penugasan-bulk.dto");
const swagger_1 = require("@nestjs/swagger");
let PenugasanController = class PenugasanController {
    constructor(penugasanService) {
        this.penugasanService = penugasanService;
    }
    assign(body, req) {
        const u = req.user;
        return this.penugasanService.assign(body, u.userId, u.role);
    }
    assignBulk(body, req) {
        const u = req.user;
        return this.penugasanService.assignBulk(body, u.userId, u.role);
    }
    findAll(req, bulan, tahun, minggu, creator, withMeta) {
        const u = req.user;
        const filter = {};
        if (bulan)
            filter.bulan = bulan;
        if (tahun)
            filter.tahun = parseInt(tahun, 10);
        if (minggu)
            filter.minggu = parseInt(minggu, 10);
        const creatorId = creator;
        const wantsMeta = withMeta === "true" || withMeta === "1";
        if (wantsMeta) {
            return this.penugasanService.listWithMeta(u.role, u.userId, filter, creatorId);
        }
        return this.penugasanService.findAll(u.role, u.userId, filter, creatorId);
    }
    detail(id, req) {
        const u = req.user;
        return this.penugasanService.findOne(id, u.role, u.userId);
    }
    update(id, body, req) {
        const u = req.user;
        return this.penugasanService.update(id, body, u.userId, u.role);
    }
    remove(id, req) {
        const u = req.user;
        return this.penugasanService.remove(id, u.userId, u.role);
    }
    async getWeekAll(minggu) {
        if (!minggu) {
            throw new common_1.BadRequestException("query 'minggu' diperlukan");
        }
        return this.penugasanService.byWeekGrouped(minggu);
    }
};
exports.PenugasanController = PenugasanController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_penugasan_dto_1.AssignPenugasanDto, Object]),
    __metadata("design:returntype", void 0)
], PenugasanController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)("bulk"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_penugasan_bulk_dto_1.AssignPenugasanBulkDto, Object]),
    __metadata("design:returntype", void 0)
], PenugasanController.prototype, "assignBulk", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("bulan")),
    __param(2, (0, common_1.Query)("tahun")),
    __param(3, (0, common_1.Query)("minggu")),
    __param(4, (0, common_1.Query)("creator")),
    __param(5, (0, common_1.Query)("withMeta")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PenugasanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PenugasanController.prototype, "detail", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_penugasan_dto_1.AssignPenugasanDto, Object]),
    __metadata("design:returntype", void 0)
], PenugasanController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PenugasanController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)("minggu/all"),
    __param(0, (0, common_1.Query)("minggu")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PenugasanController.prototype, "getWeekAll", null);
exports.PenugasanController = PenugasanController = __decorate([
    (0, swagger_1.ApiTags)("penugasan"),
    (0, common_1.Controller)("penugasan"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [penugasan_service_1.PenugasanService])
], PenugasanController);
