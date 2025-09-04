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
exports.TambahanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let TambahanService = class TambahanService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async add(data) {
        const master = await this.prisma.masterKegiatan.findUnique({
            where: { id: data.kegiatanId },
        });
        if (!master)
            throw new common_1.NotFoundException('master kegiatan tidak ditemukan');
        return this.prisma.kegiatanTambahan.create({
            data: {
                nama: master.nama_kegiatan,
                tanggal: new Date(data.tanggal),
                status: data.status,
                bukti_link: data.bukti_link,
                deskripsi: data.deskripsi,
                tanggal_selesai: data.tanggal_selesai ? new Date(data.tanggal_selesai) : undefined,
                tanggal_selesai_akhir: data.tanggal_selesai_akhir ? new Date(data.tanggal_selesai_akhir) : undefined,
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
    getOne(id, userId) {
        return this.prisma.kegiatanTambahan.findFirst({
            where: { id, userId },
            include: { kegiatan: { include: { team: true } } },
        });
    }
    async update(id, data, userId) {
        const updateData = { ...data };
        if (data.kegiatanId) {
            const master = await this.prisma.masterKegiatan.findUnique({
                where: { id: data.kegiatanId },
            });
            if (!master)
                throw new common_1.NotFoundException('master kegiatan tidak ditemukan');
            updateData.nama = master.nama_kegiatan;
            updateData.teamId = master.teamId;
        }
        return this.prisma.kegiatanTambahan.update({
            where: { id, userId },
            data: updateData,
            include: { kegiatan: { include: { team: true } } },
        });
    }
    remove(id, userId) {
        return this.prisma.kegiatanTambahan.delete({ where: { id, userId } });
    }
};
exports.TambahanService = TambahanService;
exports.TambahanService = TambahanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TambahanService);
