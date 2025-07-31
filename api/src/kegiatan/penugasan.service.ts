import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { ROLES } from "../common/roles.constants";
import { STATUS } from "../common/status.constants";
import { normalizeRole } from "../common/roles";
import { AssignPenugasanDto } from "./dto/assign-penugasan.dto";
import { AssignPenugasanBulkDto } from "./dto/assign-penugasan-bulk.dto";
import { ulid } from "ulid";

@Injectable()
export class PenugasanService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  findAll(
    _role: string,
    _userId: number,
    filter: { bulan?: string; tahun?: number; minggu?: number },
    creatorId?: string,
  ) {
    const opts: any = {
      include: {
        kegiatan: { include: { team: true } },
        pegawai: true,
      },
      where: {},
    };

    if (filter.bulan) opts.where.bulan = filter.bulan;
    if (filter.tahun) opts.where.tahun = filter.tahun;
    if (filter.minggu) opts.where.minggu = filter.minggu;
    if (creatorId) opts.where.creatorId = creatorId;

    return this.prisma.penugasan.findMany(opts);
  }

  async assign(data: AssignPenugasanDto, userId: string, role: string) {
    role = normalizeRole(role);
    const master = await this.prisma.masterKegiatan.findUnique({
      where: { id: data.kegiatanId },
    });
    if (!master) {
      throw new NotFoundException("master kegiatan tidak ditemukan");
    }
    if (role !== ROLES.ADMIN) {
      const leader = await this.prisma.member.findFirst({
        where: { teamId: master.teamId, userId, isLeader: true },
      });
      if (!leader) {
        throw new ForbiddenException("bukan ketua tim kegiatan ini");
      }
    }
    const penugasan = await this.prisma.penugasan.create({
      data: {
        id: ulid(),
        kegiatanId: data.kegiatanId,
        pegawaiId: data.pegawaiId,
        creatorId: userId,
        minggu: data.minggu,
        bulan: String(data.bulan),
        tahun: data.tahun,
        deskripsi: data.deskripsi,
        status: data.status || STATUS.BELUM,
      },
    });

    await this.notifications.create(
      data.pegawaiId,
      "Penugasan baru tersedia",
      `/tugas-mingguan/${penugasan.id}`,
    );

    return penugasan;
  }

  async assignBulk(data: AssignPenugasanBulkDto, userId: string, role: string) {
    role = normalizeRole(role);
    const master = await this.prisma.masterKegiatan.findUnique({
      where: { id: data.kegiatanId },
    });
    if (!master) {
      throw new NotFoundException("master kegiatan tidak ditemukan");
    }
    if (role !== ROLES.ADMIN) {
      const leader = await this.prisma.member.findFirst({
        where: { teamId: master.teamId, userId, isLeader: true },
      });
      if (!leader) {
        throw new ForbiddenException("bukan ketua tim kegiatan ini");
      }
    }
    const rows = data.pegawaiIds.map((pid: string) => ({
      id: ulid(),
      kegiatanId: data.kegiatanId,
      pegawaiId: pid,
      creatorId: userId,
      minggu: data.minggu,
      bulan: String(data.bulan),
      tahun: data.tahun,
      deskripsi: data.deskripsi,
      status: data.status || STATUS.BELUM,
    }));

    const created = await this.prisma.$transaction(
      rows.map((r) => this.prisma.penugasan.create({ data: r })),
    );

    await Promise.all(
      created.map((p: { pegawaiId: string; id: string }) =>
        this.notifications.create(
          p.pegawaiId,
          "Penugasan baru tersedia",
          `/tugas-mingguan/${p.id}`,
        ),
      ),
    );

    return { count: created.length };
  }

  async findOne(id: string, role: string, userId: string) {
    role = normalizeRole(role);
    const where: any = { id };

    if (role === ROLES.ADMIN || role === ROLES.PIMPINAN) {
      // no additional restrictions
    } else if (role === ROLES.KETUA) {
      where.OR = [
        {
          kegiatan: {
            team: { members: { some: { userId, isLeader: true } } },
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

  async update(
    id: string,
    data: AssignPenugasanDto,
    userId: string,
    role: string
  ) {
    role = normalizeRole(role);
    const existing = await this.prisma.penugasan.findUnique({
      where: { id },
      include: { kegiatan: true },
    });
    if (!existing) throw new NotFoundException("not found");
    if (role !== ROLES.ADMIN) {
      if (existing.pegawaiId !== userId) {
        const leader = await this.prisma.member.findFirst({
          where: { teamId: existing.kegiatan.teamId, userId, isLeader: true },
        });
        if (!leader) throw new ForbiddenException("bukan penugasan anda");
      }
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

  async remove(id: string, userId: string, role: string) {
    role = normalizeRole(role);
    const existing = await this.prisma.penugasan.findUnique({
      where: { id },
      include: { kegiatan: true },
    });
    if (!existing) throw new NotFoundException("not found");
    if (role !== ROLES.ADMIN) {
      if (existing.pegawaiId !== userId) {
        const leader = await this.prisma.member.findFirst({
          where: { teamId: existing.kegiatan.teamId, userId, isLeader: true },
        });
        if (!leader)
          throw new ForbiddenException(
            "Hanya admin atau ketua tim yang dapat menghapus penugasan"
          );
      }
    }
    const count = await this.prisma.laporanHarian.count({
      where: { penugasanId: id },
    });
    if (count > 0)
      throw new BadRequestException(
        "Hapus laporan harian penugasan ini terlebih dahulu"
      );
    await this.prisma.penugasan.delete({ where: { id } });
    return { success: true };
  }

  async byWeekGrouped(minggu: string) {
    const start = new Date(minggu);
    const offset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - offset);
    if (isNaN(start.getTime()))
      throw new BadRequestException("minggu tidak valid");

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

    const byUser: Record<
      string,
      { nama: string; tugas: { tugas: string; deskripsi?: string; status: string }[] }
    > = {};

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
}

function getWeekOfMonth(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  return Math.floor((date.getDate() + offset - 1) / 7) + 1;
}
