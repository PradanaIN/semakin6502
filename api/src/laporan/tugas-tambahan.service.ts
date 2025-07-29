import { Injectable, NotFoundException } from "@nestjs/common";
import { ROLES } from "../common/roles.constants";
import { PrismaService } from "../prisma.service";
import { AddTambahanDto } from "./dto/add-tambahan.dto";
import { UpdateTambahanDto } from "./dto/update-tambahan.dto";

@Injectable()
export class TambahanService {
  constructor(private prisma: PrismaService) {}
  async add(data: AddTambahanDto & { userId: number }) {
    const master = await this.prisma.masterKegiatan.findUnique({
      where: { id: data.kegiatanId },
    });
    
    if (!master) throw new NotFoundException('master kegiatan tidak ditemukan');
    return this.prisma.kegiatanTambahan.create({
      data: {
        nama: master.namaKegiatan,
        tanggal: new Date(data.tanggal),
        status: data.status,
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

  getByUser(userId: number) {
    return this.prisma.kegiatanTambahan.findMany({
      where: { userId },
      include: { kegiatan: { include: { team: true } } },
    });
  }

  getAll(filter: { teamId?: number; userId?: number } = {}) {
    const where: any = {};
    if (filter.teamId) where.teamId = filter.teamId;
    if (filter.userId) where.userId = filter.userId;
    return this.prisma.kegiatanTambahan.findMany({
      where,
      include: { kegiatan: { include: { team: true } }, user: true },
      orderBy: { tanggal: "desc" },
    });
  }

  getOne(id: number, userId: number, role: string) {
    const where: any = { id };
    if (role !== ROLES.ADMIN && role !== ROLES.PIMPINAN) {
      where.userId = userId;
    }
    return this.prisma.kegiatanTambahan.findFirst({
      where,
      include: { kegiatan: { include: { team: true } } },
    });
  }

  async update(id: number, data: UpdateTambahanDto, userId: number) {
    const updateData: any = { ...data };
    if (data.kegiatanId) {
      const master = await this.prisma.masterKegiatan.findUnique({
        where: { id: data.kegiatanId },
      });
      if (!master) throw new NotFoundException('master kegiatan tidak ditemukan');
      updateData.nama = master.namaKegiatan;
      updateData.teamId = master.teamId;
    }
    return this.prisma.kegiatanTambahan.update({
      where: { id, userId },
      data: updateData,
      include: { kegiatan: { include: { team: true } } },
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.kegiatanTambahan.delete({ where: { id, userId } });
  }
}
