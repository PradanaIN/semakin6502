"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_module_1 = require("./core/core.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const teams_module_1 = require("./modules/teams/teams.module");
const kegiatan_module_1 = require("./modules/kegiatan/kegiatan.module");
const laporan_module_1 = require("./modules/laporan/laporan.module");
const monitoring_module_1 = require("./modules/monitoring/monitoring.module");
const roles_module_1 = require("./modules/roles/roles.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const health_controller_1 = require("./health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            core_module_1.CoreModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            teams_module_1.TeamsModule,
            kegiatan_module_1.KegiatanModule,
            laporan_module_1.LaporanModule,
            monitoring_module_1.MonitoringModule,
            roles_module_1.RolesModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);
