import { Injectable, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PenugasanService {
  constructor(private prisma: PrismaService) {}

  findAll(role: string, userId: number, filter: { bulan?: string; tahun?: number }) {
    const opts: any = {
      include: {
        kegiatan: { include: { team: true } },
        pegawai: true,
      },
      where: {},
    };
    if (filter.bulan) opts.where.bulan = filter.bulan;
    if (filter.tahun) opts.where.tahun = filter.tahun;
    if (role !== "admin") {
      opts.where.kegiatan = {
        team: {
          members: { some: { userId, is_leader: true } },
        },
      };
    }
    return this.prisma.penugasan.findMany(opts);
  }

  async assign(data: any, userId: number, role: string) {
    const master = await this.prisma.masterKegiatan.findUnique({
      where: { id: data.kegiatanId },
    });
    if (!master) {
      throw new BadRequestException("master kegiatan tidak ditemukan");
    }
    if (role !== "admin") {
      const leader = await this.prisma.member.findFirst({
        where: { teamId: master.teamId, userId, is_leader: true },
      });
      if (!leader) {
        throw new ForbiddenException("bukan ketua tim kegiatan ini");
      }
    }
    return this.prisma.penugasan.create({
      data: {
        kegiatanId: data.kegiatanId,
        pegawaiId: data.pegawaiId,
        minggu: data.minggu,
        bulan: data.bulan,
        tahun: data.tahun,
        deskripsi: data.deskripsi,
        status: data.status || "Belum",
      },
    });
  }

  async assignBulk(data: any, userId: number, role: string) {
    const master = await this.prisma.masterKegiatan.findUnique({
      where: { id: data.kegiatanId },
    });
    if (!master) {
      throw new BadRequestException("master kegiatan tidak ditemukan");
    }
    if (role !== "admin") {
      const leader = await this.prisma.member.findFirst({
        where: { teamId: master.teamId, userId, is_leader: true },
      });
      if (!leader) {
        throw new ForbiddenException("bukan ketua tim kegiatan ini");
      }
    }
    const rows = data.pegawaiIds.map((pid: number) => ({
      kegiatanId: data.kegiatanId,
      pegawaiId: pid,
      minggu: data.minggu,
      bulan: data.bulan,
      tahun: data.tahun,
      deskripsi: data.deskripsi,
      status: data.status || "Belum",
    }));
    await this.prisma.penugasan.createMany({ data: rows });
    return { count: rows.length };
  }

  async assignBulk(data: any, userId: number, role: string) {
    const master = await this.prisma.masterKegiatan.findUnique({
      where: { id: data.kegiatanId },
    });
    if (!master) {
      throw new BadRequestException("master kegiatan tidak ditemukan");
    }
    if (role !== "admin") {
      const leader = await this.prisma.member.findFirst({
        where: { teamId: master.teamId, userId, is_leader: true },
      });
      if (!leader) {
        throw new ForbiddenException("bukan ketua tim kegiatan ini");
      }
    }
    const rows = data.pegawaiIds.map((pid: number) => ({
      kegiatanId: data.kegiatanId,
      pegawaiId: pid,
      minggu: data.minggu,
      bulan: data.bulan,
      tahun: data.tahun,
    }));
    await this.prisma.penugasan.createMany({ data: rows });
    return { count: rows.length };
  }
}
