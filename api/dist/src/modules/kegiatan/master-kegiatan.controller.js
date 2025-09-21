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
exports.MasterKegiatanController = void 0;
const common_1 = require("@nestjs/common");
const master_kegiatan_service_1 = require("./master-kegiatan.service");
const create_master_kegiatan_dto_1 = require("./dto/create-master-kegiatan.dto");
const update_master_kegiatan_dto_1 = require("./dto/update-master-kegiatan.dto");
const jwt_auth_guard_1 = require("../../shared/guards/jwt-auth.guard");
const roles_guard_1 = require("../../shared/guards/roles.guard");
const roles_decorator_1 = require("../../shared/guards/roles.decorator");
const roles_constants_1 = require("../../shared/constants/roles.constants");
const swagger_1 = require("@nestjs/swagger");
let MasterKegiatanController = class MasterKegiatanController {
    constructor(masterService) {
        this.masterService = masterService;
    }
    create(body, req) {
        const u = req.user;
        return this.masterService.create(body, u.userId, u.role);
    }
    findAll(req) {
        const { page, limit, team, search, tambahan } = req.query;
        const u = req.user;
        return this.masterService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            teamId: team,
            search: search,
            // Allow cross-team fetch when explicitly requested for tugas tambahan
            forTambahan: (typeof tambahan === 'string' && tambahan.toLowerCase() === 'true') ||
                req.headers['x-for-tambahan'] === '1',
        }, u.userId, u.role);
    }
    update(id, body, req) {
        const u = req.user;
        return this.masterService.update(id, body, u.userId, u.role);
    }
    remove(id, req) {
        const u = req.user;
        return this.masterService.remove(id, u.userId, u.role);
    }
};
exports.MasterKegiatanController = MasterKegiatanController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.KETUA),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_master_kegiatan_dto_1.CreateMasterKegiatanDto, Object]),
    __metadata("design:returntype", void 0)
], MasterKegiatanController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.KETUA, roles_constants_1.ROLES.ANGGOTA),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MasterKegiatanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, roles_decorator_1.Roles)(roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.KETUA),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_master_kegiatan_dto_1.UpdateMasterKegiatanDto, Object]),
    __metadata("design:returntype", void 0)
], MasterKegiatanController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, roles_decorator_1.Roles)(roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.KETUA),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MasterKegiatanController.prototype, "remove", null);
exports.MasterKegiatanController = MasterKegiatanController = __decorate([
    (0, swagger_1.ApiTags)("master-kegiatan"),
    (0, common_1.Controller)("master-kegiatan"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [master_kegiatan_service_1.MasterKegiatanService])
], MasterKegiatanController);
