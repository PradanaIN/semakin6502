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
exports.TambahanService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const ulid_1 = require("ulid");
const roles_constants_1 = require("../common/roles.constants");
const status_constants_1 = require("../common/status.constants");
const prisma_service_1 = require("../prisma.service");
const roles_1 = require("../common/roles");
let TambahanService = class TambahanService {
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
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
    async syncStatus(tambahanId) {
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
            console.error("Failed to sync tambahan status", err);
        }
    }
    async add(data) {
        if ([status_constants_1.STATUS.SEDANG_DIKERJAKAN, status_constants_1.STATUS.SELESAI_DIKERJAKAN].includes(data.status) &&
            !data.buktiLink) {
            throw new common_1.BadRequestException("buktiLink diperlukan ketika status sedang atau selesai");
        }
        const master = await this.prisma.masterKegiatan.findUnique({
            where: { id: data.kegiatanId },
        });
        if (!master)
            throw new common_1.NotFoundException('master kegiatan tidak ditemukan');
        return this.prisma.kegiatanTambahan.create({
            data: {
                id: (0, ulid_1.ulid)(),
                nama: master.namaKegiatan,
                tanggal: new Date(data.tanggal),
                status: data.status,
                capaianKegiatan: data.capaianKegiatan,
                buktiLink: data.buktiLink,
                deskripsi: data.deskripsi,
                tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai) : undefined,
                tanggalSelesaiAkhir: data.tanggalSelesaiAkhir ? new Date(data.tanggalSelesaiAkhir) : undefined,
                userId: data.userId,
                kegiatanId: master.id,
                teamId: master.teamId,
            },
            include: { kegiatan: { include: { team: true } } },
        });
    }
    getByUser(userId) {
        return this.prisma.kegiatanTambahan.findMany({
            where: { userId },
            include: { kegiatan: { include: { team: true } } },
        });
    }
    getAll(filter = {}) {
        const where = {};
        if (filter.teamId)
            where.teamId = filter.teamId;
        if (filter.userId)
            where.userId = filter.userId;
        return this.prisma.kegiatanTambahan.findMany({
            where,
            include: { kegiatan: { include: { team: true } }, user: true },
            orderBy: { tanggal: "desc" },
        });
    }
    getOne(id, userId, role) {
        const where = { id };
        if (role !== roles_constants_1.ROLES.ADMIN && role !== roles_constants_1.ROLES.PIMPINAN) {
            where.userId = userId;
        }
        return this.prisma.kegiatanTambahan.findFirst({
            where,
            include: { kegiatan: { include: { team: true } }, user: true },
        });
    }
    async update(id, data, userId) {
        const updateData = {};
        if (data.kegiatanId !== undefined) {
            const master = await this.prisma.masterKegiatan.findUnique({
                where: { id: data.kegiatanId },
            });
            if (!master)
                throw new common_1.NotFoundException('master kegiatan tidak ditemukan');
            updateData.kegiatanId = master.id;
            updateData.nama = master.namaKegiatan;
            updateData.teamId = master.teamId;
        }
        if (data.tanggal !== undefined) {
            updateData.tanggal = new Date(data.tanggal);
        }
        if (data.status !== undefined) {
            updateData.status = data.status;
        }
        if (data.buktiLink !== undefined) {
            updateData.buktiLink = data.buktiLink;
        }
        if (data.deskripsi !== undefined) {
            updateData.deskripsi = data.deskripsi;
        }
        if (data.capaianKegiatan !== undefined) {
            updateData.capaianKegiatan = data.capaianKegiatan;
        }
        if (data.tanggalSelesai !== undefined) {
            updateData.tanggalSelesai = new Date(data.tanggalSelesai);
        }
        if (data.tanggalSelesaiAkhir !== undefined) {
            updateData.tanggalSelesaiAkhir = new Date(data.tanggalSelesaiAkhir);
        }
        const existing = await this.prisma.kegiatanTambahan.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            const any = await this.prisma.kegiatanTambahan.findUnique({
                where: { id },
            });
            if (!any)
                throw new common_1.NotFoundException("tugas tambahan tidak ditemukan");
            throw new common_1.ForbiddenException("bukan tugas tambahan anda");
        }
        const finalStatus = (data.status ?? existing.status);
        const finalBukti = data.buktiLink ?? existing.buktiLink;
        if ([status_constants_1.STATUS.SEDANG_DIKERJAKAN, status_constants_1.STATUS.SELESAI_DIKERJAKAN].includes(finalStatus) &&
            !finalBukti) {
            throw new common_1.BadRequestException("buktiLink diperlukan ketika status sedang atau selesai");
        }
        return this.prisma.kegiatanTambahan.update({
            where: { id },
            data: updateData,
            include: { kegiatan: { include: { team: true } } },
        });
    }
    async remove(id, userId) {
        const existing = await this.prisma.kegiatanTambahan.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            const any = await this.prisma.kegiatanTambahan.findUnique({
                where: { id },
            });
            if (!any)
                throw new common_1.NotFoundException("tugas tambahan tidak ditemukan");
            throw new common_1.ForbiddenException("bukan tugas tambahan anda");
        }
        const count = await this.prisma.laporanHarian.count({
            where: { tambahanId: id },
        });
        if (count > 0) {
            throw new common_1.BadRequestException("Hapus laporan harian tugas tambahan ini terlebih dahulu");
        }
        return this.prisma.kegiatanTambahan.delete({ where: { id } });
    }
    async addLaporan(id, data, userId, role) {
        role = (0, roles_1.normalizeRole)(role);
        if (role === roles_constants_1.ROLES.PIMPINAN) {
            throw new common_1.ForbiddenException("pimpinan tidak diizinkan");
        }
        if ([status_constants_1.STATUS.SEDANG_DIKERJAKAN, status_constants_1.STATUS.SELESAI_DIKERJAKAN].includes(data.status) &&
            !data.buktiLink) {
            throw new common_1.BadRequestException("buktiLink diperlukan ketika status sedang atau selesai");
        }
        const tambahan = await this.prisma.kegiatanTambahan.findUnique({
            where: { id },
        });
        if (!tambahan)
            throw new common_1.NotFoundException("tugas tambahan tidak ditemukan");
        let targetId = data.pegawaiId ?? userId;
        if (tambahan.userId !== targetId) {
            if (role === roles_constants_1.ROLES.ADMIN) {
                targetId = tambahan.userId;
            }
            else if (role === roles_constants_1.ROLES.KETUA) {
                const leader = await this.prisma.member.findFirst({
                    where: { teamId: tambahan.teamId, userId, isLeader: true },
                });
                if (!leader)
                    throw new common_1.ForbiddenException("bukan tugas tambahan anda");
                targetId = tambahan.userId;
            }
            else {
                throw new common_1.ForbiddenException("bukan tugas tambahan anda");
            }
        }
        const laporan = await this.prisma.laporanHarian.create({
            data: {
                id: (0, ulid_1.ulid)(),
                tambahanId: id,
                pegawaiId: targetId,
                tanggal: new Date(data.tanggal),
                status: data.status,
                capaianKegiatan: data.capaianKegiatan,
                deskripsi: data.deskripsi,
                buktiLink: data.buktiLink || undefined,
                catatan: data.catatan || undefined,
            },
        });
        await this.syncStatus(id);
        await this.invalidateCache();
        return laporan;
    }
};
exports.TambahanService = TambahanService;
exports.TambahanService = TambahanService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], TambahanService);
