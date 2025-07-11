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
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/guards/roles.decorator");
let MasterKegiatanController = class MasterKegiatanController {
    constructor(masterService) {
        this.masterService = masterService;
    }
    create(body) {
        return this.masterService.create(body);
    }
    findAll() {
        return this.masterService.findAll();
    }
};
exports.MasterKegiatanController = MasterKegiatanController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)("ketua"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MasterKegiatanController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)("ketua"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MasterKegiatanController.prototype, "findAll", null);
exports.MasterKegiatanController = MasterKegiatanController = __decorate([
    (0, common_1.Controller)("master-kegiatan"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [master_kegiatan_service_1.MasterKegiatanService])
], MasterKegiatanController);
