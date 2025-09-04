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
var PenugasanService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenugasanService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const whatsapp_service_1 = require("../notifications/whatsapp.service");
const roles_constants_1 = require("../common/roles.constants");
const status_constants_1 = require("../common/status.constants");
const roles_1 = require("../common/roles");
const ulid_1 = require("ulid");
const PENUGASAN_CACHE_KEYS = [
    "monitoring:mingguan",
    "monitoring:bulananMatrix",
];
const INDONESIAN_PHONE_REGEX = /^(?:\+?62|0)8\d{8,11}$/;
let PenugasanService = PenugasanService_1 = class PenugasanService {
    constructor(prisma, notifications, whatsappService, config, cache) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.whatsappService = whatsappService;
        this.config = config;
        this.cache = cache;
        this.logger = new common_1.Logger(PenugasanService_1.name);
        this.validatePhone =
            this.config.get("PHONE_VALIDATION_ENABLED") ?? true;
    }
    // Build common Prisma where/include from provided filters
    buildFindAllOptions(filter, creatorId) {
        const opts = {
            include: {
                kegiatan: { include: { team: true } },
                pegawai: true,
            },
            where: {},
        };
        if (filter?.bulan)
            opts.where.bulan = filter.bulan;
        if (filter?.tahun)
            opts.where.tahun = filter.tahun;
        if (filter?.minggu)
            opts.where.minggu = filter.minggu;
        if (creatorId)
            opts.where.creatorId = creatorId;
        return opts;
    }
    async invalidateCache(keys = PENUGASAN_CACHE_KEYS) {
        if (!this.cache)
            return;
        const arr = Array.isArray(keys) ? keys : [keys];
        const store = this.cache.store;
        if (typeof store?.keys === "function") {
            const patterns = arr.map((p) => (p.endsWith("*") ? p : `${p}*`));
            const found = await Promise.all(patterns.map((p) => store.keys(p)));
            const toDelete = found.flat();
            if (toDelete.length) {
                await Promise.all(toDelete.map((k) => this.cache.del(k)));
            }
        }
        else {
            const cache = this.cache;
            if (typeof cache.reset === "function") {
                await cache.reset();
            }
            else if (typeof cache.store?.reset === "function") {
                await cache.store.reset();
            }
        }
    }
    findAll(_role, _userId, filter, creatorId) {
        const opts = this.buildFindAllOptions(filter, creatorId);
        return this.prisma.penugasan.findMany(opts);
    }
    // New: return data with meta timestamps
    async listWithMeta(role, userId, filter, creatorId) {
        const opts = this.buildFindAllOptions(filter, creatorId);
        const data = await this.prisma.penugasan.findMany(opts);
        // Safely derive lastChangedAt from returned rows (supports models without updatedAt)
        let last = null;
        for (const row of data) {
            const candidate = row?.updatedAt
                ? new Date(row.updatedAt)
                : row?.createdAt
                    ? new Date(row.createdAt)
                    : null;
            if (candidate && (!last || candidate > last))
                last = candidate;
        }
        return {
            data,
            meta: {
                fetchedAt: new Date().toISOString(),
                lastChangedAt: last ? last.toISOString() : null,
            },
        };
    }
    async assign(data, userId, role) {
        role = (0, roles_1.normalizeRole)(role);
        const master = await this.prisma.masterKegiatan.findUnique({
            where: { id: data.kegiatanId },
            include: { team: true },
        });
        if (!master) {
            throw new common_1.NotFoundException("master kegiatan tidak ditemukan");
        }
        if (role !== roles_constants_1.ROLES.ADMIN) {
            const leader = await this.prisma.member.findFirst({
                where: { teamId: master.teamId, userId, isLeader: true },
            });
            if (!leader) {
                throw new common_1.ForbiddenException("bukan ketua tim kegiatan ini");
            }
        }
        const penugasan = await this.prisma.penugasan.create({
            data: {
                id: (0, ulid_1.ulid)(),
                kegiatanId: data.kegiatanId,
                pegawaiId: data.pegawaiId,
                creatorId: userId,
                minggu: data.minggu,
                bulan: String(data.bulan),
                tahun: data.tahun,
                deskripsi: data.deskripsi,
                status: data.status || status_constants_1.STATUS.BELUM,
            },
        });
        const baseUrl = this.config.get("WEB_URL");
        const relLink = `/tugas-mingguan/${penugasan.id}`;
        const pegawai = await this.prisma.user.findUnique({
            where: { id: data.pegawaiId },
            select: { phone: true, nama: true },
        });
        const notifText = `Penugasan ${master.team.namaTim}: ${master.namaKegiatan}`;
        await this.notifications.create(data.pegawaiId, notifText, relLink);
        if (!pegawai?.phone) {
            this.logger.warn(`No phone number for ${pegawai?.nama ?? "unknown"}, skipping WhatsApp message`);
        }
        else if (this.validatePhone &&
            !INDONESIAN_PHONE_REGEX.test(pegawai.phone)) {
            this.logger.warn(`Invalid phone number for ${pegawai.nama}: ${pegawai.phone}, skipping WhatsApp message`);
        }
        else if (!baseUrl) {
            this.logger.warn(`WEB_URL is not configured, skipping WhatsApp message for ${pegawai.nama}`);
        }
        else {
            const waLink = new URL(relLink, baseUrl).toString();
            const waText = `Halo ${pegawai.nama},\n\nAnda mendapat penugasan:\n• Tim: ${master.team.namaTim}\n• Kegiatan: ${master.namaKegiatan}\n• Deskripsi: ${data.deskripsi}\n• Link: ${waLink}\n\nSelamat bekerja!\n`;
            this.logger.log(`Sending WhatsApp to ${pegawai.nama} (${pegawai.phone})`);
            try {
                const res = await this.whatsappService.sendMessage(pegawai.phone, waText);
                this.logger.debug(`WhatsApp response for ${pegawai.phone}: ${JSON.stringify(res)}`);
            }
            catch (err) {
                this.logger.error(`Failed to send WhatsApp message to ${pegawai.phone}`, err);
            }
        }
        await this.invalidateCache(PENUGASAN_CACHE_KEYS);
        return penugasan;
    }
    async assignBulk(data, userId, role) {
        role = (0, roles_1.normalizeRole)(role);
        const master = await this.prisma.masterKegiatan.findUnique({
            where: { id: data.kegiatanId },
            include: { team: true },
        });
        if (!master) {
            throw new common_1.NotFoundException("master kegiatan tidak ditemukan");
        }
        if (role !== roles_constants_1.ROLES.ADMIN) {
            const leader = await this.prisma.member.findFirst({
                where: { teamId: master.teamId, userId, isLeader: true },
            });
            if (!leader) {
                throw new common_1.ForbiddenException("bukan ketua tim kegiatan ini");
            }
        }
        const rows = data.pegawaiIds.map((pid) => ({
            id: (0, ulid_1.ulid)(),
            kegiatanId: data.kegiatanId,
            pegawaiId: pid,
            creatorId: userId,
            minggu: data.minggu,
            bulan: String(data.bulan),
            tahun: data.tahun,
            deskripsi: data.deskripsi,
            status: data.status || status_constants_1.STATUS.BELUM,
        }));
        const created = await this.prisma.$transaction(rows.map((r) => this.prisma.penugasan.create({ data: r })));
        const baseUrl = this.config.get("WEB_URL");
        await Promise.all(created.map(async (p) => {
            const relLink = `/tugas-mingguan/${p.id}`;
            const notifText = `Penugasan ${master.team.namaTim}: ${master.namaKegiatan}`;
            await this.notifications.create(p.pegawaiId, notifText, relLink);
            const pegawai = await this.prisma.user.findUnique({
                where: { id: p.pegawaiId },
                select: { phone: true, nama: true },
            });
            if (!pegawai?.phone) {
                this.logger.warn(`No phone number for ${pegawai?.nama ?? "unknown"}, skipping WhatsApp message`);
            }
            else if (this.validatePhone &&
                !INDONESIAN_PHONE_REGEX.test(pegawai.phone)) {
                this.logger.warn(`Invalid phone number for ${pegawai.nama}: ${pegawai.phone}, skipping WhatsApp message`);
            }
            else if (!baseUrl) {
                this.logger.warn(`WEB_URL is not configured, skipping WhatsApp message for ${pegawai.nama}`);
            }
            else {
                const waLink = new URL(relLink, baseUrl).toString();
                const waText = `Halo, ${pegawai.nama}!\n\n` +
                    `Anda mendapat penugasan:\n\n` +
                    `👥 Tim       : ${master.team.namaTim}\n` +
                    `📌 Kegiatan  : ${master.namaKegiatan}\n` +
                    `📝 Deskripsi : ${data.deskripsi}\n` +
                    `🔗 Akses     : ${waLink}\n\n` +
                    `Selamat bekerja & tetap semangat!\n`;
                this.logger.log(`Sending WhatsApp to ${pegawai.nama} (${pegawai.phone})`);
                try {
                    const res = await this.whatsappService.sendMessage(pegawai.phone, waText);
                    this.logger.debug(`WhatsApp response for ${pegawai.phone}: ${JSON.stringify(res)}`);
                }
                catch (err) {
                    this.logger.error(`Failed to send WhatsApp message to ${pegawai.phone}`, err);
                }
            }
        }));
        await this.invalidateCache(PENUGASAN_CACHE_KEYS);
        return { count: created.length };
    }
    async findOne(id, role, userId) {
        role = (0, roles_1.normalizeRole)(role);
        const where = { id };
        if (role === roles_constants_1.ROLES.ADMIN || role === roles_constants_1.ROLES.PIMPINAN) {
            // no additional restrictions
        }
        else if (role === roles_constants_1.ROLES.KETUA) {
            where.OR = [
                {
                    kegiatan: {
                        team: { members: { some: { userId, isLeader: true } } },
                    },
                },
                { pegawaiId: userId },
            ];
        }
        else {
            where.pegawaiId = userId;
        }
        return this.prisma.penugasan.findFirst({
            where,
            include: { kegiatan: { include: { team: true } }, pegawai: true },
        });
    }
    async update(id, data, userId, role) {
        role = (0, roles_1.normalizeRole)(role);
        const existing = await this.prisma.penugasan.findUnique({
            where: { id },
            include: { kegiatan: true },
        });
        if (!existing)
            throw new common_1.NotFoundException("not found");
        if (role !== roles_constants_1.ROLES.ADMIN) {
            if (existing.pegawaiId !== userId) {
                const leader = await this.prisma.member.findFirst({
                    where: { teamId: existing.kegiatan.teamId, userId, isLeader: true },
                });
                if (!leader)
                    throw new common_1.ForbiddenException("bukan penugasan anda");
            }
        }
        const pen = await this.prisma.penugasan.update({
            where: { id },
            data: {
                kegiatanId: data.kegiatanId,
                pegawaiId: data.pegawaiId,
                minggu: data.minggu,
                bulan: String(data.bulan),
                tahun: data.tahun,
                deskripsi: data.deskripsi,
                status: data.status,
            },
            include: { kegiatan: { include: { team: true } }, pegawai: true },
        });
        await this.invalidateCache(PENUGASAN_CACHE_KEYS);
        return pen;
    }
    async remove(id, userId, role) {
        role = (0, roles_1.normalizeRole)(role);
        const existing = await this.prisma.penugasan.findUnique({
            where: { id },
            include: { kegiatan: true },
        });
        if (!existing)
            throw new common_1.NotFoundException("not found");
        if (role !== roles_constants_1.ROLES.ADMIN) {
            if (existing.pegawaiId !== userId) {
                const leader = await this.prisma.member.findFirst({
                    where: { teamId: existing.kegiatan.teamId, userId, isLeader: true },
                });
                if (!leader)
                    throw new common_1.ForbiddenException("Hanya admin atau ketua tim yang dapat menghapus penugasan");
            }
        }
        const count = await this.prisma.laporanHarian.count({
            where: { penugasanId: id },
        });
        if (count > 0)
            throw new common_1.BadRequestException("Hapus laporan harian penugasan ini terlebih dahulu");
        await this.prisma.penugasan.delete({ where: { id } });
        await this.invalidateCache(PENUGASAN_CACHE_KEYS);
        return { success: true };
    }
    async byWeekGrouped(minggu) {
        const start = new Date(minggu);
        const offset = (start.getDay() + 6) % 7;
        start.setDate(start.getDate() - offset);
        if (isNaN(start.getTime()))
            throw new common_1.BadRequestException("minggu tidak valid");
        const where = {
            minggu: getWeekOfMonth(start),
            bulan: String(start.getMonth() + 1),
            tahun: start.getFullYear(),
        };
        const tugas = await this.prisma.penugasan.findMany({
            where,
            include: { pegawai: true, kegiatan: true },
            orderBy: { pegawai: { nama: "asc" } },
        });
        const byUser = {};
        for (const t of tugas) {
            if (!byUser[t.pegawaiId])
                byUser[t.pegawaiId] = { nama: t.pegawai.nama, tugas: [] };
            byUser[t.pegawaiId].tugas.push({
                tugas: t.kegiatan.namaKegiatan,
                deskripsi: t.deskripsi || "",
                status: t.status,
            });
        }
        return Object.entries(byUser)
            .map(([id, v]) => ({ userId: id, nama: v.nama, tugas: v.tugas }))
            .sort((a, b) => a.nama.localeCompare(b.nama));
    }
};
exports.PenugasanService = PenugasanService;
exports.PenugasanService = PenugasanService = PenugasanService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        whatsapp_service_1.WhatsappService,
        config_1.ConfigService, Object])
], PenugasanService);
function getWeekOfMonth(date) {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    return Math.floor((date.getDate() + offset - 1) / 7) + 1;
}
