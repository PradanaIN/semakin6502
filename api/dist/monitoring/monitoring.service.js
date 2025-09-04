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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../prisma.service");
const months_1 = __importDefault(require("../common/months"));
const status_constants_1 = require("../common/status.constants");
const roles_constants_1 = require("../common/roles.constants");
const holidays_1 = require("../config/holidays");
// Tanggal pada service monitoring diasumsikan diproses dalam timezone UTC.
const CACHE_TTL = 600; // seconds
let MonitoringService = class MonitoringService {
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
    }
    async lastUpdate() {
        const latest = await this.prisma.laporanHarian.findFirst({
            orderBy: { tanggal: "desc" },
            select: { tanggal: true },
        });
        return latest?.tanggal || null;
    }
    async harian(tanggal, teamId, userId) {
        const key = `monitoring:harian:${tanggal}:${teamId || ""}:${userId || ""}`;
        const cached = await this.cache?.get(key);
        if (cached)
            return cached;
        const base = new Date(tanggal);
        if (isNaN(base.getTime()))
            throw new common_1.BadRequestException("tanggal tidak valid");
        const year = base.getFullYear();
        const month = base.getMonth();
        const start = new Date(Date.UTC(year, month, 1));
        const end = new Date(Date.UTC(year, month + 1, 0));
        const where = { tanggal: { gte: start, lte: end } };
        if (userId)
            where.pegawaiId = userId;
        if (teamId)
            where.OR = [
                { penugasan: { kegiatan: { teamId } } },
                { tambahan: { teamId } },
            ];
        const records = await this.prisma.laporanHarian.findMany({
            where,
            select: { tanggal: true },
        });
        const exists = new Set(records.map((r) => r.tanggal.toISOString()));
        const result = [];
        for (let d = 1; d <= end.getUTCDate(); d++) {
            const date = new Date(Date.UTC(year, month, d));
            const dateStr = date.toISOString();
            result.push({ tanggal: dateStr, adaKegiatan: exists.has(dateStr) });
        }
        await this.cache?.set(key, result, CACHE_TTL);
        return result;
    }
    async mingguan(minggu, teamId, userId) {
        const key = `monitoring:mingguan:${minggu}:${teamId || ""}:${userId || ""}`;
        const cached = await this.cache?.get(key);
        if (cached)
            return cached;
        const targetDate = new Date(minggu);
        if (isNaN(targetDate.getTime()))
            throw new common_1.BadRequestException("minggu tidak valid");
        const mingguKe = getWeekOfMonth(targetDate);
        const bulan = String(targetDate.getMonth() + 1);
        const tahun = targetDate.getFullYear();
        const start = new Date(targetDate);
        const offset = (start.getUTCDay() + 6) % 7; // days since Monday
        start.setUTCDate(start.getUTCDate() - offset);
        const end = new Date(start);
        end.setUTCDate(start.getUTCDate() + 6);
        const laporanWhere = { tanggal: { gte: start, lte: end } };
        if (userId)
            laporanWhere.pegawaiId = userId;
        if (teamId)
            laporanWhere.OR = [
                { penugasan: { kegiatan: { teamId } } },
                { tambahan: { teamId } },
            ];
        const records = await this.prisma.laporanHarian.findMany({
            where: laporanWhere,
            select: { tanggal: true, status: true },
        });
        const tugasWhere = {
            minggu: mingguKe,
            bulan,
            tahun,
        };
        if (teamId)
            tugasWhere.kegiatan = { teamId };
        if (userId)
            tugasWhere.pegawaiId = userId;
        const tugas = await this.prisma.penugasan.findMany({
            where: tugasWhere,
            select: { status: true },
        });
        const perDay = {};
        for (const r of records) {
            const dateStr = r.tanggal.toISOString();
            if (!perDay[dateStr])
                perDay[dateStr] = { selesai: 0, total: 0 };
            perDay[dateStr].total += 1;
            if (r.status === status_constants_1.STATUS.SELESAI_DIKERJAKAN)
                perDay[dateStr].selesai += 1;
        }
        const hari = [
            "Minggu",
            "Senin",
            "Selasa",
            "Rabu",
            "Kamis",
            "Jumat",
            "Sabtu",
        ];
        const detail = [];
        const totalSelesai = tugas.filter((t) => t.status === status_constants_1.STATUS.SELESAI_DIKERJAKAN).length;
        const totalTugas = tugas.length;
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setUTCDate(start.getUTCDate() + i);
            const dateStr = d.toISOString();
            const data = perDay[dateStr] || { selesai: 0, total: 0 };
            const persen = data.total > 0 ? 100 : 0;
            detail.push({
                hari: hari[d.getUTCDay()],
                tanggal: dateStr,
                selesai: data.selesai,
                total: data.total,
                persen,
            });
        }
        const totalProgress = totalTugas
            ? Math.round((totalSelesai / totalTugas) * 100)
            : 0;
        const result = {
            minggu: mingguKe,
            bulan: monthName(targetDate),
            tanggal: `${start.toISOString()} - ${end.toISOString()}`,
            totalProgress,
            totalSelesai,
            totalTugas,
            detail,
        };
        await this.cache?.set(key, result, CACHE_TTL);
        return result;
    }
    async bulanan(year, teamId, userId) {
        const yr = parseInt(year, 10);
        if (isNaN(yr))
            throw new common_1.BadRequestException("year tidak valid");
        const results = [];
        for (let i = 0; i < months_1.default.length; i++) {
            const first = new Date(Date.UTC(yr, i, 1));
            const weeks = await this.penugasanBulan(first.toISOString(), teamId, userId);
            if (weeks.length === 0) {
                results.push({ bulan: months_1.default[i], persen: 0 });
                continue;
            }
            const bulanAvg = weeks.reduce((sum, w) => sum + w.persen, 0) / weeks.length;
            results.push({ bulan: months_1.default[i], persen: Math.round(bulanAvg) });
        }
        return results;
    }
    async harianBulan(tanggal, teamId) {
        const base = new Date(tanggal);
        if (isNaN(base.getTime()))
            throw new common_1.BadRequestException("tanggal tidak valid");
        const year = base.getFullYear();
        const month = base.getMonth();
        const start = new Date(Date.UTC(year, month, 1));
        const end = new Date(Date.UTC(year, month + 1, 0));
        const where = {
            tanggal: { gte: start, lte: end },
            pegawai: {
                role: { notIn: [roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.PIMPINAN] },
                NOT: { username: { startsWith: "demo" } },
            },
        };
        if (teamId)
            where.OR = [
                { penugasan: { kegiatan: { teamId } } },
                { tambahan: { teamId } },
            ];
        const records = await this.prisma.laporanHarian.findMany({
            where,
            include: { pegawai: true },
        });
        const userWhere = {
            role: { notIn: [roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.PIMPINAN] },
            NOT: { username: { startsWith: "demo" } },
        };
        if (teamId)
            userWhere.members = { some: { teamId } };
        const users = await this.prisma.user.findMany({
            where: userWhere,
            select: { id: true, nama: true },
            orderBy: { nama: "asc" },
        });
        if (records.length === 0) {
            return users.map((u) => {
                const detail = [];
                for (let d = 1; d <= end.getUTCDate(); d++) {
                    const date = new Date(Date.UTC(year, month, d));
                    detail.push({ tanggal: date.toISOString(), count: 0 });
                }
                return { userId: u.id, nama: u.nama, detail };
            });
        }
        const byUser = {};
        for (const u of users) {
            byUser[u.id] = { nama: u.nama, counts: {} };
        }
        for (const r of records) {
            if (!byUser[r.pegawaiId])
                continue;
            const dateStr = r.tanggal.toISOString();
            byUser[r.pegawaiId].counts[dateStr] =
                (byUser[r.pegawaiId].counts[dateStr] || 0) + 1;
        }
        return Object.entries(byUser)
            .map(([id, v]) => {
            const detail = [];
            for (let d = 1; d <= end.getUTCDate(); d++) {
                const date = new Date(Date.UTC(year, month, d));
                const dateStr = date.toISOString();
                detail.push({
                    tanggal: dateStr,
                    count: v.counts[dateStr] || 0,
                });
            }
            return { userId: id, nama: v.nama, detail };
        })
            .sort((a, b) => a.nama.localeCompare(b.nama));
    }
    async harianAll(tanggal, teamId) {
        const date = new Date(tanggal);
        if (isNaN(date.getTime()))
            throw new common_1.BadRequestException("tanggal tidak valid");
        const where = {
            tanggal: date,
            pegawai: {
                role: { notIn: [roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.PIMPINAN] },
                NOT: { username: { startsWith: "demo" } },
            },
        };
        if (teamId)
            where.OR = [
                { penugasan: { kegiatan: { teamId } } },
                { tambahan: { teamId } },
            ];
        const whereUser = {
            role: { notIn: [roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.PIMPINAN] },
            NOT: { username: { startsWith: "demo" } },
        };
        if (teamId)
            whereUser.members = { some: { teamId } };
        const [records, users] = await Promise.all([
            this.prisma.laporanHarian.findMany({
                where,
                include: { pegawai: true },
            }),
            this.prisma.user.findMany({
                where: whereUser,
                select: { id: true, nama: true },
                orderBy: { nama: "asc" },
            }),
        ]);
        if (records.length === 0) {
            return users.map((u) => ({
                userId: u.id,
                nama: u.nama,
                selesai: 0,
                total: 0,
                persen: 0,
            }));
        }
        const byUser = {};
        for (const u of users) {
            byUser[u.id] = { nama: u.nama, selesai: 0, total: 0 };
        }
        for (const r of records) {
            const u = byUser[r.pegawaiId];
            if (!u)
                continue;
            u.total += 1;
            if (r.status === status_constants_1.STATUS.SELESAI_DIKERJAKAN)
                u.selesai += 1;
        }
        return Object.entries(byUser)
            .map(([id, v]) => ({
            userId: id,
            nama: v.nama,
            selesai: v.selesai,
            total: v.total,
            persen: v.total ? Math.round((v.selesai / v.total) * 100) : 0,
        }))
            .sort((a, b) => a.nama.localeCompare(b.nama));
    }
    async mingguanAll(minggu, teamId) {
        const targetDate = new Date(minggu);
        if (isNaN(targetDate.getTime()))
            throw new common_1.BadRequestException("minggu tidak valid");
        const start = new Date(targetDate);
        const offset = (start.getUTCDay() + 6) % 7;
        start.setUTCDate(start.getUTCDate() - offset);
        const end = new Date(start);
        end.setUTCDate(start.getUTCDate() + 6);
        const where = {
            tanggal: { gte: start, lte: end },
            pegawai: {
                role: { notIn: [roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.PIMPINAN] },
                NOT: { username: { startsWith: "demo" } },
            },
        };
        if (teamId)
            where.OR = [
                { penugasan: { kegiatan: { teamId } } },
                { tambahan: { teamId } },
            ];
        const records = (await this.prisma.laporanHarian.findMany({
            where,
            include: { pegawai: true },
        })).filter((r) => !r.pegawai?.username?.startsWith("demo"));
        if (records.length === 0) {
            const users = (await this.prisma.user.findMany({
                where: teamId ? { members: { some: { teamId } } } : {},
                orderBy: { nama: "asc" },
            })) || [];
            return users
                .filter((u) => !u.username?.startsWith("demo"))
                .map((u) => ({
                userId: u.id,
                nama: u.nama,
                selesai: 0,
                total: 0,
                persen: 0,
            }));
        }
        const whereUser = {
            role: { notIn: [roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.PIMPINAN] },
            NOT: { username: { startsWith: "demo" } },
        };
        if (teamId)
            whereUser.members = { some: { teamId } };
        const users = await this.prisma.user.findMany({
            where: whereUser,
            select: { id: true, nama: true },
            orderBy: { nama: "asc" },
        });
        const byUser = {};
        for (const u of users) {
            byUser[u.id] = { nama: u.nama, selesai: 0, total: 0 };
        }
        for (const r of records) {
            const u = byUser[r.pegawaiId];
            if (!u)
                continue;
            u.total += 1;
            if (r.status === status_constants_1.STATUS.SELESAI_DIKERJAKAN)
                u.selesai += 1;
        }
        return Object.entries(byUser)
            .map(([id, v]) => ({
            userId: id,
            nama: v.nama,
            selesai: v.selesai,
            total: v.total,
            persen: v.total ? Math.round((v.selesai / v.total) * 100) : 0,
        }))
            .sort((a, b) => a.nama.localeCompare(b.nama));
    }
    async mingguanBulan(tanggal, teamId) {
        const base = new Date(tanggal);
        if (isNaN(base.getTime()))
            throw new common_1.BadRequestException("tanggal tidak valid");
        const year = base.getFullYear();
        const month = base.getMonth();
        const monthStart = new Date(Date.UTC(year, month, 1));
        const monthEnd = new Date(Date.UTC(year, month + 1, 0));
        const firstMonday = new Date(monthStart);
        firstMonday.setUTCDate(monthStart.getUTCDate() - ((monthStart.getUTCDay() + 6) % 7));
        const weekStarts = [];
        for (let d = new Date(firstMonday); d <= monthEnd; d.setUTCDate(d.getUTCDate() + 7)) {
            weekStarts.push(new Date(d));
        }
        const where = {
            tanggal: { gte: monthStart, lte: monthEnd },
            pegawai: {
                role: { notIn: [roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.PIMPINAN] },
                NOT: { username: { startsWith: "demo" } },
            },
        };
        if (teamId)
            where.OR = [
                { penugasan: { kegiatan: { teamId } } },
                { tambahan: { teamId } },
            ];
        const records = await this.prisma.laporanHarian.findMany({
            where,
            include: { pegawai: true },
        });
        const whereUser = {
            role: { notIn: [roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.PIMPINAN] },
            NOT: { username: { startsWith: "demo" } },
        };
        if (teamId)
            whereUser.members = { some: { teamId } };
        const users = await this.prisma.user.findMany({
            where: whereUser,
            select: { id: true, nama: true },
            orderBy: { nama: "asc" },
        });
        if (records.length === 0) {
            const emptyWeeks = weekStarts.map(() => ({
                selesai: 0,
                total: 0,
                persen: 0,
            }));
            return users.map((u) => ({
                userId: u.id,
                nama: u.nama,
                weeks: emptyWeeks,
            }));
        }
        const byUser = {};
        for (const u of users) {
            byUser[u.id] = { nama: u.nama, perWeek: {} };
        }
        for (const r of records) {
            const u = byUser[r.pegawaiId];
            if (!u)
                continue;
            const idx = Math.floor((r.tanggal.getTime() - weekStarts[0].getTime()) /
                (7 * 24 * 60 * 60 * 1000));
            if (!u.perWeek[idx])
                u.perWeek[idx] = { selesai: 0, total: 0 };
            u.perWeek[idx].total += 1;
            if (r.status === status_constants_1.STATUS.SELESAI_DIKERJAKAN)
                u.perWeek[idx].selesai += 1;
        }
        return Object.entries(byUser)
            .map(([id, v]) => {
            const weeks = weekStarts.map((_, i) => {
                const w = v.perWeek[i] || { selesai: 0, total: 0 };
                const persen = w.total > 0 ? 100 : 0;
                return { selesai: w.selesai, total: w.total, persen };
            });
            return { userId: id, nama: v.nama, weeks };
        })
            .sort((a, b) => a.nama.localeCompare(b.nama));
    }
    async penugasanMinggu(minggu, teamId, userId) {
        const targetDate = new Date(minggu);
        if (isNaN(targetDate.getTime()))
            throw new common_1.BadRequestException("minggu tidak valid");
        const mingguKe = getWeekOfMonth(targetDate);
        const bulan = String(targetDate.getMonth() + 1);
        const tahun = targetDate.getFullYear();
        // Align to Monday for consistency even though it's not used afterward
        const start = new Date(targetDate);
        const offset = (start.getDay() + 6) % 7;
        start.setDate(start.getDate() - offset);
        const where = {
            minggu: mingguKe,
            bulan,
            tahun,
        };
        if (teamId)
            where.kegiatan = { teamId };
        if (userId)
            where.pegawaiId = userId;
        const tugas = await this.prisma.penugasan.findMany({
            where,
            select: { status: true },
        });
        let selesai = 0;
        let belum = 0;
        for (const t of tugas) {
            if (t.status === status_constants_1.STATUS.SELESAI_DIKERJAKAN)
                selesai += 1;
            if (t.status === status_constants_1.STATUS.BELUM || t.status === status_constants_1.STATUS.SEDANG_DIKERJAKAN)
                belum += 1;
        }
        return { total: tugas.length, selesai, belum };
    }
    async penugasanBulan(tanggal, teamId, userId) {
        const base = new Date(tanggal);
        if (isNaN(base.getTime()))
            throw new common_1.BadRequestException("tanggal tidak valid");
        const year = base.getFullYear();
        const month = base.getMonth();
        const monthStart = new Date(Date.UTC(year, month, 1));
        const monthEnd = new Date(Date.UTC(year, month + 1, 0));
        const firstMonday = new Date(monthStart);
        firstMonday.setUTCDate(monthStart.getUTCDate() - ((monthStart.getUTCDay() + 6) % 7));
        const weekStarts = [];
        for (let d = new Date(firstMonday); d <= monthEnd; d.setUTCDate(d.getUTCDate() + 7)) {
            weekStarts.push(new Date(d));
        }
        const where = {
            tahun: year,
            bulan: String(month + 1),
        };
        if (teamId)
            where.kegiatan = { teamId };
        if (userId)
            where.pegawaiId = userId;
        const tugas = await this.prisma.penugasan.findMany({
            where,
            select: { minggu: true, status: true },
        });
        const perWeek = {};
        for (const t of tugas) {
            const idx = t.minggu - 1;
            if (!perWeek[idx])
                perWeek[idx] = { selesai: 0, total: 0 };
            perWeek[idx].total += 1;
            if (t.status === status_constants_1.STATUS.SELESAI_DIKERJAKAN)
                perWeek[idx].selesai += 1;
        }
        return weekStarts.map((_, i) => {
            const w = perWeek[i] || { selesai: 0, total: 0 };
            const persen = w.total ? Math.round((w.selesai / w.total) * 100) : 0;
            return { minggu: i + 1, selesai: w.selesai, total: w.total, persen };
        });
    }
    async bulananAll(year, teamId, bulan) {
        const yr = parseInt(year, 10);
        if (isNaN(yr))
            throw new common_1.BadRequestException("year tidak valid");
        const where = {
            tahun: yr,
            pegawai: {
                role: { notIn: [roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.PIMPINAN] },
                NOT: { username: { startsWith: "demo" } },
            },
        };
        if (bulan) {
            const bln = parseInt(bulan, 10);
            if (isNaN(bln) || bln < 1 || bln > 12)
                throw new common_1.BadRequestException("bulan tidak valid");
            where.bulan = String(bln);
        }
        if (teamId)
            where.kegiatan = { teamId };
        const tugas = await this.prisma.penugasan.findMany({
            where,
            include: { pegawai: true },
        });
        const byUser = {};
        for (const t of tugas) {
            if (!byUser[t.pegawaiId])
                byUser[t.pegawaiId] = { nama: t.pegawai.nama, selesai: 0, total: 0 };
            byUser[t.pegawaiId].total += 1;
            if (t.status === status_constants_1.STATUS.SELESAI_DIKERJAKAN)
                byUser[t.pegawaiId].selesai += 1;
        }
        return Object.entries(byUser)
            .map(([id, v]) => ({
            userId: id,
            nama: v.nama,
            selesai: v.selesai,
            total: v.total,
            persen: v.total ? Math.round((v.selesai / v.total) * 100) : 0,
        }))
            .sort((a, b) => a.nama.localeCompare(b.nama));
    }
    async bulananMatrix(year, teamId) {
        const key = `monitoring:bulananMatrix:${year}:${teamId || ""}`;
        const cached = await this.cache?.get(key);
        if (cached)
            return cached;
        const yr = parseInt(year, 10);
        if (isNaN(yr))
            throw new common_1.BadRequestException("year tidak valid");
        const where = {
            tahun: yr,
            pegawai: {
                role: { notIn: [roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.PIMPINAN] },
                NOT: { username: { startsWith: "demo" } },
            },
        };
        if (teamId)
            where.kegiatan = { teamId };
        const tugas = await this.prisma.penugasan.findMany({
            where,
            include: { pegawai: true },
        });
        const byUser = {};
        for (const t of tugas) {
            const idx = parseInt(t.bulan, 10) - 1;
            if (!byUser[t.pegawaiId])
                byUser[t.pegawaiId] = { nama: t.pegawai.nama, perMonth: {} };
            if (!byUser[t.pegawaiId].perMonth[idx])
                byUser[t.pegawaiId].perMonth[idx] = { selesai: 0, total: 0 };
            byUser[t.pegawaiId].perMonth[idx].total += 1;
            if (t.status === status_constants_1.STATUS.SELESAI_DIKERJAKAN)
                byUser[t.pegawaiId].perMonth[idx].selesai += 1;
        }
        const result = Object.entries(byUser)
            .map(([id, v]) => {
            const months = months_1.default.map((_, i) => {
                const m = v.perMonth[i] || { selesai: 0, total: 0 };
                const persen = m.total ? Math.round((m.selesai / m.total) * 100) : 0;
                return { selesai: m.selesai, total: m.total, persen };
            });
            return { userId: id, nama: v.nama, months };
        })
            .sort((a, b) => a.nama.localeCompare(b.nama));
        await this.cache?.set(key, result, CACHE_TTL);
        return result;
    }
    async laporanTerlambat(teamId) {
        const key = `monitoring:laporanTerlambat:${teamId || ""}`;
        const cached = await this.cache?.get(key);
        if (cached)
            return cached;
        const whereUser = {
            NOT: { role: { in: [roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.PIMPINAN] } },
        };
        if (teamId)
            whereUser.members = { some: { teamId } };
        const users = await this.prisma.user.findMany({
            where: whereUser,
            include: { laporan: { orderBy: { tanggal: "desc" }, take: 1 } },
            orderBy: { nama: "asc" },
        });
        const today = new Date();
        // Gunakan midnight lokal agar konsisten dengan hari kerja lokal (Senin–Jumat)
        today.setHours(0, 0, 0, 0);
        // Hitung selisih hari kerja (Senin-Jumat) antara dua tanggal (UTC midnight).
        const businessDaysDiff = (from, to) => {
            // Tidak menghitung tanggal awal; hanya hari setelahnya sampai "to" (inklusif) yang dihitung,
            // sehingga Jumat -> Senin = 1 hari kerja.
            if (to <= from)
                return 0;
            const holidaySet = (0, holidays_1.getHolidaySet)();
            const MS = 86400000;
            const days = Math.floor((to.getTime() - from.getTime()) / MS);
            const fullWeeks = Math.floor(days / 7);
            let workdays = fullWeeks * 5;
            let rem = days % 7;
            // Mulai dari hari setelah "from"
            let dow = (from.getDay() + 1) % 7; // 0=Sunday..6=Saturday (lokal)
            for (let i = 0; i < rem; i++) {
                if (dow !== 0 && dow !== 6)
                    workdays += 1; // Mon..Fri
                dow = (dow + 1) % 7;
            }
            // Kurangi hari libur/cuti bersama yang jatuh pada hari kerja di rentang (from, to]
            for (let i = 1; i <= days; i++) {
                const cur = new Date(from.getTime() + i * MS);
                const isWeekend = cur.getDay() === 0 || cur.getDay() === 6;
                if (!isWeekend && (0, holidays_1.isHolidayLocal)(cur, holidaySet))
                    workdays -= 1;
            }
            return workdays;
        };
        const result = { day1: [], day3: [], day7: [] };
        for (const u of users) {
            const last = u.laporan[0]?.tanggal;
            let diff = Infinity;
            let lastDate = null;
            if (last) {
                const d = new Date(last);
                d.setHours(0, 0, 0, 0);
                // Gunakan hari kerja (Senin-Jumat) untuk penentuan bucket keterlambatan
                diff = businessDaysDiff(d, today);
                lastDate = d.toISOString();
            }
            const entry = { userId: u.id, nama: u.nama, lastDate };
            if (diff >= 7)
                result.day7.push(entry);
            else if (diff >= 3)
                result.day3.push(entry);
            else if (diff >= 1)
                result.day1.push(entry);
        }
        await this.cache?.set(key, result, CACHE_TTL);
        return result;
    }
    getHolidays() {
        // Kembalikan daftar string YYYY-MM-DD untuk dipakai di frontend
        return Array.from((0, holidays_1.getHolidaySet)().values());
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], MonitoringService);
function monthName(date) {
    return months_1.default[date.getMonth()];
}
function getWeekOfMonth(date) {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // Monday-based
    return Math.floor((date.getDate() + offset - 1) / 7) + 1;
}
