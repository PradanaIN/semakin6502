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
var LaporanService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaporanService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const ulid_1 = require("ulid");
const prisma_service_1 = require("../prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const exceljs_1 = require("exceljs");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const roles_1 = require("../common/roles");
const roles_constants_1 = require("../common/roles.constants");
const status_constants_1 = require("../common/status.constants");
function getWeekOfMonth(date) {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    return Math.floor((date.getDate() + offset - 1) / 7) + 1;
}
// Semua perhitungan tanggal pada service ini mengasumsikan server
// berjalan dalam timezone UTC.
let LaporanService = LaporanService_1 = class LaporanService {
    constructor(prisma, notifications, cache) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.cache = cache;
        this.logger = new common_1.Logger(LaporanService_1.name);
    }
    getAll(skip, take) {
        const pagination = {};
        if (typeof skip === "number" && skip > 0)
            pagination.skip = skip;
        if (typeof take === "number" && take > 0)
            pagination.take = take;
        return this.prisma.laporanHarian.findMany({
            orderBy: { tanggal: "desc" },
            include: {
                pegawai: true,
                penugasan: { include: { kegiatan: { include: { team: true } } } },
                tambahan: { include: { kegiatan: { include: { team: true } } } },
            },
            ...pagination,
        });
    }
    async invalidateCache(keys) {
        if (!this.cache)
            return;
        const cache = this.cache;
        if (keys) {
            const arr = Array.isArray(keys) ? keys : [keys];
            await Promise.all(arr.map((key) => cache.del(key)));
            return;
        }
        if (typeof cache.reset === "function") {
            await cache.reset();
        }
        else if (typeof cache.store?.reset === "function") {
            await cache.store.reset();
        }
        else if (typeof cache.store?.keys === "function") {
            const allKeys = await cache.store.keys();
            if (allKeys?.length) {
                await Promise.all(allKeys.map((k) => cache.del(k)));
            }
        }
        else if (typeof cache.store?.clear === "function") {
            await cache.store.clear();
        }
    }
    async syncPenugasanStatus(penugasanId) {
        try {
            const pen = await this.prisma.penugasan.findUnique({
                where: { id: penugasanId },
                include: { kegiatan: true, pegawai: true },
            });
            if (!pen)
                return;
            const finished = await this.prisma.laporanHarian.findFirst({
                where: { penugasanId, status: status_constants_1.STATUS.SELESAI_DIKERJAKAN },
            });
            if (finished) {
                if (pen.status !== status_constants_1.STATUS.SELESAI_DIKERJAKAN) {
                    await this.prisma.penugasan.update({
                        where: { id: penugasanId },
                        data: { status: status_constants_1.STATUS.SELESAI_DIKERJAKAN },
                    });
                    const leaders = await this.prisma.member.findMany({
                        where: { teamId: pen.kegiatan.teamId, isLeader: true },
                        select: { userId: true },
                    });
                    const text = `${pen.pegawai?.nama ?? "Seorang pegawai"} telah menyelesaikan penugasan ${pen.kegiatan.namaKegiatan}`;
                    await Promise.all(leaders.map((l) => this.notifications.create(l.userId, text, `/tugas-mingguan/${pen.id}`)));
                }
                return;
            }
            const latest = await this.prisma.laporanHarian.findFirst({
                where: { penugasanId },
                orderBy: { tanggal: "desc" },
            });
            await this.prisma.penugasan.update({
                where: { id: penugasanId },
                data: { status: latest?.status || status_constants_1.STATUS.BELUM },
            });
        }
        catch (err) {
            this.logger.error("Failed to sync penugasan status", err);
        }
    }
    async syncTambahanStatus(tambahanId) {
        try {
            const tambahan = await this.prisma.kegiatanTambahan.findUnique({
                where: { id: tambahanId },
            });
            if (!tambahan)
                return;
            const finished = await this.prisma.laporanHarian.findFirst({
                where: { tambahanId, status: status_constants_1.STATUS.SELESAI_DIKERJAKAN },
            });
            if (finished) {
                if (tambahan.status !== status_constants_1.STATUS.SELESAI_DIKERJAKAN) {
                    await this.prisma.kegiatanTambahan.update({
                        where: { id: tambahanId },
                        data: { status: status_constants_1.STATUS.SELESAI_DIKERJAKAN },
                    });
                }
                return;
            }
            const latest = await this.prisma.laporanHarian.findFirst({
                where: { tambahanId },
                orderBy: { tanggal: "desc" },
            });
            await this.prisma.kegiatanTambahan.update({
                where: { id: tambahanId },
                data: { status: latest?.status || status_constants_1.STATUS.BELUM },
            });
        }
        catch (err) {
            this.logger.error("Failed to sync tambahan status", err);
        }
    }
    async submit(data, userId, role) {
        role = (0, roles_1.normalizeRole)(role);
        if (role === roles_constants_1.ROLES.PIMPINAN) {
            throw new common_1.ForbiddenException("pimpinan tidak diizinkan");
        }
        if ([status_constants_1.STATUS.SEDANG_DIKERJAKAN, status_constants_1.STATUS.SELESAI_DIKERJAKAN].includes(data.status) &&
            !data.buktiLink) {
            throw new common_1.BadRequestException("buktiLink diperlukan ketika status sedang atau selesai");
        }
        const pen = await this.prisma.penugasan.findUnique({
            where: { id: data.penugasanId },
            include: { kegiatan: true },
        });
        if (!pen)
            throw new common_1.NotFoundException("Penugasan tidak ditemukan");
        let targetId = data.pegawaiId ?? userId;
        if (pen.pegawaiId !== targetId) {
            if (role === roles_constants_1.ROLES.ADMIN) {
                targetId = pen.pegawaiId;
            }
            else if (role === roles_constants_1.ROLES.KETUA) {
                const leader = await this.prisma.member.findFirst({
                    where: { teamId: pen.kegiatan.teamId, userId, isLeader: true },
                });
                if (!leader)
                    throw new common_1.ForbiddenException("bukan penugasan anda");
                targetId = pen.pegawaiId;
            }
            else {
                throw new common_1.ForbiddenException("bukan penugasan anda");
            }
        }
        const laporan = await this.prisma.laporanHarian.create({
            data: {
                id: (0, ulid_1.ulid)(),
                penugasanId: data.penugasanId,
                pegawaiId: targetId,
                tanggal: new Date(data.tanggal),
                status: data.status,
                capaianKegiatan: data.capaianKegiatan,
                deskripsi: data.deskripsi,
                buktiLink: data.buktiLink || undefined,
                catatan: data.catatan || undefined,
            },
        });
        try {
            await this.syncPenugasanStatus(data.penugasanId);
        }
        catch (err) {
            // Ignore sync errors so laporan is still returned
            this.logger.error("Failed to sync penugasan status", err);
        }
        await this.invalidateCache();
        return laporan;
    }
    getByTanggal(tanggal) {
        return this.prisma.laporanHarian.findMany({
            where: { tanggal: new Date(tanggal) },
            include: {
                pegawai: true,
                penugasan: { include: { kegiatan: true } },
                tambahan: { include: { kegiatan: true } },
            },
        });
    }
    getByUserTanggal(userId, tanggal) {
        return this.prisma.laporanHarian.findMany({
            where: { pegawaiId: userId, tanggal: new Date(tanggal) },
            include: {
                penugasan: { include: { kegiatan: true } },
                tambahan: { include: { kegiatan: true } },
            },
            orderBy: { tanggal: "desc" },
        });
    }
    getByPenugasan(penugasanId) {
        return this.prisma.laporanHarian.findMany({
            where: { penugasanId },
            include: {
                pegawai: true,
                penugasan: { include: { kegiatan: true } },
                tambahan: { include: { kegiatan: true } },
            },
        });
    }
    getByTambahan(tambahanId) {
        return this.prisma.laporanHarian.findMany({
            where: { tambahanId },
            include: {
                pegawai: true,
                penugasan: { include: { kegiatan: true } },
                tambahan: { include: { kegiatan: true } },
            },
        });
    }
    getByUser(userId) {
        return this.prisma.laporanHarian.findMany({
            where: { pegawaiId: userId },
            orderBy: { tanggal: "desc" },
            include: {
                penugasan: { include: { kegiatan: true } },
                tambahan: { include: { kegiatan: true } },
            },
        });
    }
    async update(id, data, userId, role) {
        role = (0, roles_1.normalizeRole)(role);
        if (role === roles_constants_1.ROLES.PIMPINAN) {
            throw new common_1.ForbiddenException("pimpinan tidak diizinkan");
        }
        const existing = await this.prisma.laporanHarian.findUnique({
            where: { id },
            include: {
                penugasan: { include: { kegiatan: true } },
                tambahan: true,
            },
        });
        if (!existing)
            throw new common_1.NotFoundException("not found");
        if (existing.pegawaiId !== userId) {
            if (role === roles_constants_1.ROLES.ADMIN) {
                // admins can modify any report
            }
            else if (role === roles_constants_1.ROLES.KETUA) {
                const teamId = existing.penugasan
                    ? existing.penugasan.kegiatan.teamId
                    : existing.tambahan?.teamId;
                const leader = await this.prisma.member.findFirst({
                    where: { teamId, userId, isLeader: true },
                });
                if (!leader)
                    throw new common_1.ForbiddenException("bukan laporan anda");
            }
            else {
                throw new common_1.ForbiddenException("bukan laporan anda");
            }
        }
        const finalBukti = data.buktiLink ?? existing.buktiLink;
        if ([status_constants_1.STATUS.SEDANG_DIKERJAKAN, status_constants_1.STATUS.SELESAI_DIKERJAKAN].includes(data.status) &&
            !finalBukti) {
            throw new common_1.BadRequestException("buktiLink diperlukan ketika status sedang atau selesai");
        }
        const laporan = await this.prisma.laporanHarian.update({
            where: { id },
            data: {
                tanggal: new Date(data.tanggal),
                status: data.status,
                capaianKegiatan: data.capaianKegiatan,
                deskripsi: data.deskripsi,
                buktiLink: data.buktiLink,
                catatan: data.catatan,
            },
        });
        try {
            if (existing.penugasanId)
                await this.syncPenugasanStatus(existing.penugasanId);
            if (existing.tambahanId)
                await this.syncTambahanStatus(existing.tambahanId);
        }
        catch (err) {
            this.logger.error("Failed to sync status", err);
        }
        await this.invalidateCache();
        return laporan;
    }
    async remove(id, userId, role) {
        role = (0, roles_1.normalizeRole)(role);
        if (role === roles_constants_1.ROLES.PIMPINAN) {
            throw new common_1.ForbiddenException("pimpinan tidak diizinkan");
        }
        const existing = await this.prisma.laporanHarian.findUnique({
            where: { id },
            include: {
                penugasan: { include: { kegiatan: true } },
                tambahan: true,
            },
        });
        if (!existing)
            throw new common_1.NotFoundException("not found");
        if (existing.pegawaiId !== userId) {
            if (role === roles_constants_1.ROLES.ADMIN) {
                // admins can remove any report
            }
            else if (role === roles_constants_1.ROLES.KETUA) {
                const teamId = existing.penugasan
                    ? existing.penugasan.kegiatan.teamId
                    : existing.tambahan?.teamId;
                const leader = await this.prisma.member.findFirst({
                    where: { teamId, userId, isLeader: true },
                });
                if (!leader)
                    throw new common_1.ForbiddenException("bukan laporan anda");
            }
            else {
                throw new common_1.ForbiddenException("bukan laporan anda");
            }
        }
        await this.prisma.laporanHarian.delete({ where: { id } });
        try {
            if (existing.penugasanId)
                await this.syncPenugasanStatus(existing.penugasanId);
            if (existing.tambahanId)
                await this.syncTambahanStatus(existing.tambahanId);
        }
        catch (err) {
            this.logger.error("Failed to sync status", err);
        }
        await this.invalidateCache();
        return { success: true };
    }
    async getByMonthWeek(userId, bulan, minggu, includeTambahan = false) {
        const where = { pegawaiId: userId, tambahanId: null };
        if (bulan || minggu) {
            where.penugasan = {};
            if (bulan)
                where.penugasan.bulan = bulan;
            if (minggu)
                where.penugasan.minggu = minggu;
        }
        const laporan = await this.prisma.laporanHarian.findMany({
            where,
            orderBy: { tanggal: "desc" },
            include: {
                penugasan: { include: { kegiatan: { include: { team: true } } } },
            },
        });
        const mapped = laporan.map((l) => ({
            ...l,
            type: "mingguan",
            penugasan: l.penugasan
                ? { ...l.penugasan, tim: l.penugasan.kegiatan.team }
                : null,
        }));
        if (!includeTambahan)
            return mapped;
        let tambahan = await this.prisma.kegiatanTambahan.findMany({
            where: { userId },
            include: { kegiatan: { include: { team: true } } },
        });
        if (bulan) {
            const bln = parseInt(bulan, 10);
            tambahan = tambahan.filter((t) => t.tanggal.getMonth() + 1 === bln);
        }
        if (minggu) {
            tambahan = tambahan.filter((t) => getWeekOfMonth(t.tanggal) === minggu);
        }
        const mappedTambahan = await Promise.all(tambahan.map(async (t) => {
            const latest = await this.prisma.laporanHarian.findFirst({
                where: { tambahanId: t.id },
                orderBy: { tanggal: "desc" },
            });
            return {
                id: t.id,
                tanggal: latest?.tanggal ?? t.tanggal,
                status: t.status,
                deskripsi: latest?.deskripsi ?? t.deskripsi,
                capaianKegiatan: latest?.capaianKegiatan ?? t.capaianKegiatan,
                buktiLink: latest?.buktiLink ?? t.buktiLink,
                catatan: latest?.catatan ?? null,
                type: "tambahan",
                penugasan: {
                    kegiatan: {
                        namaKegiatan: t.nama,
                        deskripsi: t.kegiatan?.deskripsi,
                        team: t.kegiatan?.team,
                    },
                    tim: t.kegiatan?.team,
                },
            };
        }));
        return [...mapped, ...mappedTambahan].sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime());
    }
    async export(userId, fileFormat, bulan, minggu, includeTambahan = false, tanggal) {
        const data = tanggal
            ? await this.getByUserTanggal(userId, tanggal)
            : await this.getByMonthWeek(userId, bulan, minggu, includeTambahan);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { nama: true },
        });
        const now = new Date();
        const exportDateFormatted = (0, date_fns_1.format)(now, "d MMMM yyyy", { locale: locale_1.id }); // e.g., 31 Juli 2025
        const months = [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
        ];
        const range = tanggal
            ? `Tanggal ${(0, date_fns_1.format)(new Date(tanggal), "d MMMM yyyy", { locale: locale_1.id })}`
            : bulan
                ? `Bulan ${months[parseInt(bulan) - 1]}${minggu ? ` Minggu ${minggu}` : ""}`
                : "Semua";
        const exportFileName = (prefix = "LaporanHarian") => {
            const timestamp = now
                .toLocaleString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            })
                .replace(/\D/g, "")
                .slice(0, 12); // DDMMYYYYHHMM
            const monthStr = bulan ? `_${months[parseInt(bulan) - 1]}` : "";
            const weekStr = minggu ? `_Minggu_${minggu}` : "";
            return `${timestamp}_${prefix}${monthStr}${weekStr}`;
        };
        const wb = new exceljs_1.Workbook();
        const ws = wb.addWorksheet("Laporan Harian");
        // Metadata
        ws.addRow([`Nama: ${user?.nama || ""}`]).font = { bold: true };
        ws.addRow([`Tanggal Export: ${exportDateFormatted}`]).font = { bold: true };
        ws.addRow([`Rentang: ${range}`]).font = { bold: true };
        ws.addRow([]);
        // Header
        const headers = [
            "No",
            "Tanggal",
            "Tim",
            "Kegiatan",
            "Deskripsi",
            "Capaian",
            "Bukti Dukung",
            "Catatan",
        ];
        const columnWidths = [3, 13, 15, 20, 30, 30, 20, 20];
        const headerRow = ws.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.eachCell((cell, i) => {
            cell.alignment = {
                vertical: "middle",
                horizontal: "center",
                wrapText: true,
            };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFDEEAF6" },
            };
            cell.border = {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
            };
            ws.getColumn(i + 1).width = columnWidths[i];
        });
        // Urutkan berdasarkan tanggal lama ke baru
        data.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
        // Data rows
        data.forEach((d, idx) => {
            const formattedDate = (0, date_fns_1.format)(new Date(d.tanggal), "dd-MM-yyyy");
            const row = ws.addRow([
                idx + 1,
                formattedDate,
                d.penugasan.kegiatan.team?.namaTim || "",
                d.penugasan.kegiatan.namaKegiatan,
                d.deskripsi || "",
                d.capaianKegiatan,
                d.buktiLink || "",
                d.catatan || "",
            ]);
            row.alignment = { vertical: "top", wrapText: true };
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin" },
                    bottom: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" },
                };
            });
        });
        return {
            buffer: await wb.xlsx.writeBuffer(),
            fileName: `${exportFileName()}.xlsx`,
        };
    }
};
exports.LaporanService = LaporanService;
exports.LaporanService = LaporanService = LaporanService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService, Object])
], LaporanService);
