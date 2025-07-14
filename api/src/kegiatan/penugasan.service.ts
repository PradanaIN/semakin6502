import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { ROLES } from "../common/roles.constants";

@Injectable()
export class PenugasanService {
  constructor(private prisma: PrismaService) {}

  findAll(
    role: string,
    userId: number,
    filter: { bulan?: string; tahun?: number }
  ) {
    role = normalizeRole(role);
    const opts: any = {
      include: {
        kegiatan: { include: { team: true } },
        pegawai: true,
      },
      where: {},
    };

    if (filter.bulan) opts.where.bulan = filter.bulan;
    if (filter.tahun) opts.where.tahun = filter.tahun;

    if (role === ROLES.ADMIN || role === ROLES.PIMPINAN) {
      // admins and top management can see all assignments
    } else if (role === ROLES.KETUA) {
      // team leaders can see assignments in their teams as well as tasks
      // assigned specifically to them
      opts.where.OR = [
        {
          kegiatan: {
            team: {
              members: { some: { userId, is_leader: true } },
            },
          },
        },
        { pegawaiId: userId },
      ];
    } else {
      // regular members only see their own assignments
      opts.where.pegawaiId = userId;
    }

    return this.prisma.penugasan.findMany(opts);
  }

  async assign(data: any, userId: number, role: string) {
    role = normalizeRole(role);
    const master = await this.prisma.masterKegiatan.findUnique({
      where: { id: data.kegiatanId },
    });
    if (!master) {
      throw new BadRequestException("master kegiatan tidak ditemukan");
    }
    if (role !== ROLES.ADMIN) {
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
        bulan: String(data.bulan),
        tahun: data.tahun,
        deskripsi: data.deskripsi,
        status: data.status || "Belum",
      },
    });
  }

  async assignBulk(data: any, userId: number, role: string) {
    role = normalizeRole(role);
    const master = await this.prisma.masterKegiatan.findUnique({
      where: { id: data.kegiatanId },
    });
    if (!master) {
      throw new BadRequestException("master kegiatan tidak ditemukan");
    }
    if (role !== ROLES.ADMIN) {
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
      bulan: String(data.bulan),
      tahun: data.tahun,
      deskripsi: data.deskripsi,
      status: data.status || "Belum",
    }));
    await this.prisma.penugasan.createMany({ data: rows });
    return { count: rows.length };
  }

  async findOne(id: number, role: string, userId: number) {
    role = normalizeRole(role);
    const where: any = { id };

    if (role === ROLES.ADMIN || role === ROLES.PIMPINAN) {
      // no additional restrictions
    } else if (role === ROLES.KETUA) {
      where.OR = [
        {
          kegiatan: {
            team: { members: { some: { userId, is_leader: true } } },
          },
        },
        { pegawaiId: userId },
      ];
    } else {
      where.pegawaiId = userId;
    }

    return this.prisma.penugasan.findFirst({
      where,
      include: { kegiatan: { include: { team: true } }, pegawai: true },
    });
  }

  async update(id: number, data: any, userId: number, role: string) {
    role = normalizeRole(role);
    const existing = await this.prisma.penugasan.findUnique({
      where: { id },
      include: { kegiatan: true },
    });
    if (!existing) throw new BadRequestException("not found");
    if (role !== ROLES.ADMIN) {
      const leader = await this.prisma.member.findFirst({
        where: { teamId: existing.kegiatan.teamId, userId, is_leader: true },
      });
      if (!leader) throw new ForbiddenException("bukan ketua tim kegiatan ini");
    }
    return this.prisma.penugasan.update({
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
  }

  async remove(id: number, userId: number, role: string) {
    role = normalizeRole(role);
    const existing = await this.prisma.penugasan.findUnique({
      where: { id },
      include: { kegiatan: true },
    });
    if (!existing) throw new BadRequestException("not found");
    if (role !== ROLES.ADMIN) {
      const leader = await this.prisma.member.findFirst({
        where: { teamId: existing.kegiatan.teamId, userId, is_leader: true },
      });
      if (!leader) throw new ForbiddenException("bukan ketua tim kegiatan ini");
    }
    await this.prisma.penugasan.delete({ where: { id } });
    return { success: true };
  }
}
