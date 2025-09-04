"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KegiatanModule = void 0;
const common_1 = require("@nestjs/common");
const master_kegiatan_controller_1 = require("./master-kegiatan.controller");
const master_kegiatan_service_1 = require("./master-kegiatan.service");
const penugasan_controller_1 = require("./penugasan.controller");
const penugasan_service_1 = require("./penugasan.service");
const prisma_service_1 = require("../prisma.service");
const notifications_module_1 = require("../notifications/notifications.module");
let KegiatanModule = class KegiatanModule {
};
exports.KegiatanModule = KegiatanModule;
exports.KegiatanModule = KegiatanModule = __decorate([
    (0, common_1.Module)({
        imports: [notifications_module_1.NotificationsModule],
        controllers: [master_kegiatan_controller_1.MasterKegiatanController, penugasan_controller_1.PenugasanController],
        providers: [prisma_service_1.PrismaService, master_kegiatan_service_1.MasterKegiatanService, penugasan_service_1.PenugasanService],
    })
], KegiatanModule);
