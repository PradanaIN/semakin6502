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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const monitoring_service_1 = require("../monitoring/monitoring.service");
const notifications_service_1 = require("./notifications.service");
let ReminderService = class ReminderService {
    constructor(monitoring, notifications) {
        this.monitoring = monitoring;
        this.notifications = notifications;
    }
    async handleCron() {
        const res = await this.monitoring.laporanTerlambat();
        const users = [...res.day1, ...res.day3, ...res.day7];
        await Promise.all(users.map((u) => this.notifications.create(u.userId, "Anda belum mengirim laporan harian", "/laporan-harian")));
    }
};
exports.ReminderService = ReminderService;
__decorate([
    (0, schedule_1.Cron)("0 6 * * *") // every day at 06:00
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReminderService.prototype, "handleCron", null);
exports.ReminderService = ReminderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService,
        notifications_service_1.NotificationsService])
], ReminderService);
