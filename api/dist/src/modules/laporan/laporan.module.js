"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaporanModule = void 0;
const common_1 = require("@nestjs/common");
const laporan_controller_1 = require("./laporan.controller");
const laporan_service_1 = require("./laporan.service");
const tugas_tambahan_controller_1 = require("./tugas-tambahan.controller");
const tugas_tambahan_service_1 = require("./tugas-tambahan.service");
const notifications_module_1 = require("../notifications/notifications.module");
let LaporanModule = class LaporanModule {
};
exports.LaporanModule = LaporanModule;
exports.LaporanModule = LaporanModule = __decorate([
    (0, common_1.Module)({
        imports: [notifications_module_1.NotificationsModule],
        controllers: [laporan_controller_1.LaporanController, tugas_tambahan_controller_1.TambahanController],
        providers: [laporan_service_1.LaporanService, tugas_tambahan_service_1.TambahanService],
        exports: [tugas_tambahan_service_1.TambahanService],
    })
], LaporanModule);
