import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { ulid } from "ulid";
import { ROLES } from "../common/roles.constants";
import { PrismaService } from "../prisma.service";
import { AddTambahanDto } from "./dto/add-tambahan.dto";
import { UpdateTambahanDto } from "./dto/update-tambahan.dto";
import { SubmitTambahanLaporanDto } from "./dto/submit-tambahan-laporan.dto";
import { normalizeRole } from "../common/roles";

@Injectable()
export class TambahanService {
  constructor(private prisma: PrismaService) {}
  async add(data: AddTambahanDto & { userId: string }) {
    const master = await this.prisma.masterKegiatan.findUnique({
      where: { id: data.kegiatanId },
    });
    
    if (!master) throw new NotFoundException('master kegiatan tidak ditemukan');
    return this.prisma.kegiatanTambahan.create({
      data: {
        id: ulid(),
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

  getByUser(userId: string) {
    return this.prisma.kegiatanTambahan.findMany({
      where: { userId },
      include: { kegiatan: { include: { team: true } } },
    });
  }

  getAll(filter: { teamId?: string; userId?: string } = {}) {
    const where: any = {};
    if (filter.teamId) where.teamId = filter.teamId;
    if (filter.userId) where.userId = filter.userId;
    return this.prisma.kegiatanTambahan.findMany({
      where,
      include: { kegiatan: { include: { team: true } }, user: true },
      orderBy: { tanggal: "desc" },
    });
  }

  getOne(id: string, userId: string, role: string) {
    const where: any = { id };
    if (role !== ROLES.ADMIN && role !== ROLES.PIMPINAN) {
      where.userId = userId;
    }
    return this.prisma.kegiatanTambahan.findFirst({
      where,
      include: { kegiatan: { include: { team: true } } },
    });
  }

  async update(id: string, data: UpdateTambahanDto, userId: string) {
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

  remove(id: string, userId: string) {
    return this.prisma.kegiatanTambahan.delete({ where: { id, userId } });
  }

  async addLaporan(
    id: string,
    data: SubmitTambahanLaporanDto,
    userId: string,
    role: string
  ) {
    role = normalizeRole(role);
    if (role === ROLES.PIMPINAN) {
      throw new ForbiddenException("pimpinan tidak diizinkan");
    }

    const tambahan = await this.prisma.kegiatanTambahan.findUnique({
      where: { id },
    });
    if (!tambahan) throw new NotFoundException("tugas tambahan tidak ditemukan");

    let targetId = data.pegawaiId ?? userId;
    if (tambahan.userId !== targetId) {
      if (role === ROLES.ADMIN) {
        targetId = tambahan.userId;
      } else if (role === ROLES.KETUA) {
        const leader = await this.prisma.member.findFirst({
          where: { teamId: tambahan.teamId, userId, isLeader: true },
        });
        if (!leader) throw new ForbiddenException("bukan tugas tambahan anda");
        targetId = tambahan.userId;
      } else {
        throw new ForbiddenException("bukan tugas tambahan anda");
      }
    }

    return this.prisma.laporanHarian.create({
      data: {
        id: ulid(),
        penugasanId: id,
        pegawaiId: targetId,
        tanggal: new Date(data.tanggal),
        status: data.status,
        capaianKegiatan: data.capaianKegiatan,
        deskripsi: data.deskripsi,
        buktiLink: data.buktiLink || undefined,
        catatan: data.catatan || undefined,
      },
    });
  }
}
