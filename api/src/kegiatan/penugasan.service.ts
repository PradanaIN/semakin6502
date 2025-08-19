import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { WhatsappService } from "../notifications/whatsapp.service";
import { ROLES } from "../common/roles.constants";
import { STATUS } from "../common/status.constants";
import { normalizeRole } from "../common/roles";
import { AssignPenugasanDto } from "./dto/assign-penugasan.dto";
import { AssignPenugasanBulkDto } from "./dto/assign-penugasan-bulk.dto";
import { ulid } from "ulid";

const PENUGASAN_CACHE_KEYS = [
  "monitoring:mingguan",
  "monitoring:bulananMatrix",
];

const INDONESIAN_PHONE_REGEX = /^(?:\+?62|0)8\d{8,11}$/;

@Injectable()
export class PenugasanService {
  private readonly logger = new Logger(PenugasanService.name);
  private readonly validatePhone: boolean;
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private whatsappService: WhatsappService,
    private config: ConfigService,
    @Inject(CACHE_MANAGER)
    private cache?: Cache & {
      reset?: () => Promise<void>;
      store?: { reset: () => Promise<void> };
    }
  ) {
    this.validatePhone = this.config.get<boolean>("PHONE_VALIDATION_ENABLED") ?? true;
  }

  private async invalidateCache(keys: string | string[] = PENUGASAN_CACHE_KEYS) {
    if (!this.cache) return;
    const arr = Array.isArray(keys) ? keys : [keys];
    const store: any = (this.cache as any).store;
    if (typeof store?.keys === "function") {
      const patterns = arr.map((p) => (p.endsWith("*") ? p : `${p}*`));
      const found = await Promise.all(patterns.map((p: string) => store.keys(p)));
      const toDelete = found.flat();
      if (toDelete.length) {
        await Promise.all(toDelete.map((k: string) => this.cache!.del(k)));
      }
    } else {
      const cache: any = this.cache;
      if (typeof cache.reset === "function") {
        await cache.reset();
      } else if (typeof cache.store?.reset === "function") {
        await cache.store.reset();
      }
    }
  }

  findAll(
    _role: string,
    _userId: string,
    filter: { bulan?: string; tahun?: number; minggu?: number },
    creatorId?: string
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
      include: { team: true },
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

    const baseUrl = this.config.get<string>("WEB_URL");
    const relLink = `/tugas-mingguan/${penugasan.id}`;
    const waLink = `${baseUrl}${relLink}`;
    const pegawai = await this.prisma.user.findUnique({
      where: { id: data.pegawaiId },
      select: { phone: true, nama: true },
    });
    const notifText = `Penugasan baru dari ${master.team.namaTim}: ${master.namaKegiatan}`;
    await this.notifications.create(data.pegawaiId, notifText, relLink);
    if (!pegawai?.phone) {
      this.logger.warn(`No phone number for ${pegawai?.nama ?? "unknown"}, skipping WhatsApp message`);
    } else if (this.validatePhone && !INDONESIAN_PHONE_REGEX.test(pegawai.phone)) {
      this.logger.warn(`Invalid phone number for ${pegawai.nama}: ${pegawai.phone}, skipping WhatsApp message`);
    } else {
      const waText = `Halo ${pegawai.nama},\n\nAnda mendapat penugasan:\n• Tim: ${master.team.namaTim}\n• Kegiatan: ${master.namaKegiatan}\n• Deskripsi: ${data.deskripsi}\n• Link: ${waLink}\n\nSelamat bekerja!\n`;
      this.logger.log(`Sending WhatsApp to ${pegawai.nama} (${pegawai.phone})`);
      try {
        const res = await this.whatsappService.sendMessage(pegawai.phone, waText);
        this.logger.debug(
          `WhatsApp response for ${pegawai.phone}: ${JSON.stringify(res)}`
        );
      } catch (err) {
        this.logger.error(
          `Failed to send WhatsApp message to ${pegawai.phone}`,
          err as Error
        );
      }
    }
    await this.invalidateCache(PENUGASAN_CACHE_KEYS);
    return penugasan;
  }

  async assignBulk(data: AssignPenugasanBulkDto, userId: string, role: string) {
    role = normalizeRole(role);
    const master = await this.prisma.masterKegiatan.findUnique({
      where: { id: data.kegiatanId },
      include: { team: true },
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
      rows.map((r) => this.prisma.penugasan.create({ data: r }))
    );

    const baseUrl = this.config.get<string>("WEB_URL");

    await Promise.all(
      created.map(async (p: { pegawaiId: string; id: string }) => {
        const relLink = `/tugas-mingguan/${p.id}`;
        const waLink = `${baseUrl}${relLink}`;
        const notifText = `Penugasan baru dari ${master.team.namaTim}: ${master.namaKegiatan}`;
        await this.notifications.create(p.pegawaiId, notifText, relLink);
        const pegawai = await this.prisma.user.findUnique({
          where: { id: p.pegawaiId },
          select: { phone: true, nama: true },
        });
        if (!pegawai?.phone) {
          this.logger.warn(`No phone number for ${pegawai?.nama ?? "unknown"}, skipping WhatsApp message`);
        } else if (this.validatePhone && !INDONESIAN_PHONE_REGEX.test(pegawai.phone)) {
          this.logger.warn(`Invalid phone number for ${pegawai.nama}: ${pegawai.phone}, skipping WhatsApp message`);
        } else {
          const waText =
            `Halo, ${pegawai.nama}!\n\n` +
            `Anda mendapat penugasan:\n\n` +
            `• Tim: ${master.team.namaTim}\n` +
            `• Kegiatan: ${master.namaKegiatan}\n` +
            `• Deskripsi: ${data.deskripsi}\n` +
            `• Link: ${waLink}\n\n` +
            `Selamat bekerja!\n`;
          this.logger.log(`Sending WhatsApp to ${pegawai.nama} (${pegawai.phone})`);
          try {
            const res = await this.whatsappService.sendMessage(
              pegawai.phone,
              waText
            );
            this.logger.debug(
              `WhatsApp response for ${pegawai.phone}: ${JSON.stringify(res)}`
            );
          } catch (err) {
            this.logger.error(
              `Failed to send WhatsApp message to ${pegawai.phone}`,
              err as Error
            );
          }
        }
      })
    );
    await this.invalidateCache(PENUGASAN_CACHE_KEYS);
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
    await this.invalidateCache(PENUGASAN_CACHE_KEYS);
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
      {
        nama: string;
        tugas: { tugas: string; deskripsi?: string; status: string }[];
      }
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
