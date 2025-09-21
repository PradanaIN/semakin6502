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
exports.TambahanController = void 0;
const common_1 = require("@nestjs/common");
const tugas_tambahan_service_1 = require("./tugas-tambahan.service");
const jwt_auth_guard_1 = require("../../shared/guards/jwt-auth.guard");
const roles_guard_1 = require("../../shared/guards/roles.guard");
const roles_decorator_1 = require("../../shared/guards/roles.decorator");
const roles_constants_1 = require("../../shared/constants/roles.constants");
const add_tambahan_dto_1 = require("./dto/add-tambahan.dto");
const update_tambahan_dto_1 = require("./dto/update-tambahan.dto");
const submit_tambahan_laporan_dto_1 = require("./dto/submit-tambahan-laporan.dto");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../core/database/prisma.service");
let TambahanController = class TambahanController {
    constructor(tambahanService, prisma) {
        this.tambahanService = tambahanService;
        this.prisma = prisma;
    }
    add(body, req) {
        const userId = req.user.userId;
        return this.tambahanService.add({ ...body, userId });
    }
    getByUser(req) {
        const userId = req.user.userId;
        return this.tambahanService.getByUser(userId);
    }
    async getAll(teamId, userId, req) {
        const { role, userId: requesterId } = req.user;
        if (role === roles_constants_1.ROLES.KETUA && teamId) {
            const leader = await this.prisma.member.findFirst({
                where: { teamId, userId: requesterId, isLeader: true },
            });
            if (!leader) {
                throw new common_1.ForbiddenException('bukan ketua tim');
            }
        }
        return this.tambahanService.getAll({ teamId, userId });
    }
    addLaporan(id, body, req) {
        const u = req.user;
        return this.tambahanService.addLaporan(id, body, u.userId, u.role);
    }
    detail(id, req) {
        const { userId, role } = req.user;
        return this.tambahanService.getOne(id, userId, role);
    }
    update(id, body, req) {
        const userId = req.user.userId;
        return this.tambahanService.update(id, body, userId);
    }
    remove(id, req) {
        const userId = req.user.userId;
        return this.tambahanService.remove(id, userId);
    }
};
exports.TambahanController = TambahanController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.KETUA, roles_constants_1.ROLES.ANGGOTA),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_tambahan_dto_1.AddTambahanDto, Object]),
    __metadata("design:returntype", void 0)
], TambahanController.prototype, "add", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TambahanController.prototype, "getByUser", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, roles_decorator_1.Roles)(roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.PIMPINAN, roles_constants_1.ROLES.KETUA),
    __param(0, (0, common_1.Query)('teamId')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TambahanController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(":id/laporan"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_tambahan_laporan_dto_1.SubmitTambahanLaporanDto, Object]),
    __metadata("design:returntype", void 0)
], TambahanController.prototype, "addLaporan", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TambahanController.prototype, "detail", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, roles_decorator_1.Roles)(roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.KETUA, roles_constants_1.ROLES.ANGGOTA),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tambahan_dto_1.UpdateTambahanDto, Object]),
    __metadata("design:returntype", void 0)
], TambahanController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, roles_decorator_1.Roles)(roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.KETUA, roles_constants_1.ROLES.ANGGOTA),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TambahanController.prototype, "remove", null);
exports.TambahanController = TambahanController = __decorate([
    (0, swagger_1.ApiTags)("tugas-tambahan"),
    (0, common_1.Controller)("tugas-tambahan"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [tugas_tambahan_service_1.TambahanService,
        prisma_service_1.PrismaService])
], TambahanController);
