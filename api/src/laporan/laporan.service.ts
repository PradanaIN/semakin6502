import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Inject,
  Logger,
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { ulid } from "ulid";
import { PrismaService } from "../prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { Workbook } from "exceljs";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { normalizeRole } from "../common/roles";
import { ROLES } from "../common/roles.constants";
import { STATUS } from "../common/status.constants";
import { SubmitLaporanDto } from "./dto/submit-laporan.dto";

function getWeekOfMonth(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  return Math.floor((date.getDate() + offset - 1) / 7) + 1;
}

// Semua perhitungan tanggal pada service ini mengasumsikan server
// berjalan dalam timezone UTC.

@Injectable()
export class LaporanService {
  private readonly logger = new Logger(LaporanService.name);
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    @Inject(CACHE_MANAGER)
    private cache?: Cache & { reset: () => Promise<void> }
  ) {}

  getAll(skip?: number, take?: number) {
    const pagination: { skip?: number; take?: number } = {};
    if (typeof skip === "number" && skip > 0) pagination.skip = skip;
    if (typeof take === "number" && take > 0) pagination.take = take;

    return this.prisma.laporanHarian.findMany({
      orderBy: { tanggal: "desc" },
      include: {
        pegawai: true,
        penugasan: { include: { kegiatan: true } },
        tambahan: { include: { kegiatan: true } },
      },
      ...pagination,
    });
  }

  private async invalidateCache(keys?: string | string[]) {
    // Issue #123 (https://github.com/semakin6502/semakin6502/issues/123): replace global reset with targeted invalidation
    if (!this.cache) return;
    if (keys) {
      const arr = Array.isArray(keys) ? keys : [keys];
      await Promise.all(arr.map((key) => this.cache!.del(key)));
    } else {
      await this.cache.reset();
    }
  }

  private async syncPenugasanStatus(penugasanId: string) {
    try {
      const pen = await this.prisma.penugasan.findUnique({
        where: { id: penugasanId },
        include: { kegiatan: true, pegawai: true },
      });
      if (!pen) return;

      const finished = await this.prisma.laporanHarian.findFirst({
        where: { penugasanId, status: STATUS.SELESAI_DIKERJAKAN },
      });
      if (finished) {
        if (pen.status !== STATUS.SELESAI_DIKERJAKAN) {
          await this.prisma.penugasan.update({
            where: { id: penugasanId },
            data: { status: STATUS.SELESAI_DIKERJAKAN },
          });

          const leaders = await this.prisma.member.findMany({
            where: { teamId: pen.kegiatan.teamId, isLeader: true },
            select: { userId: true },
          });
          const text = `${
            pen.pegawai?.nama ?? "Seorang pegawai"
          } telah menyelesaikan penugasan ${pen.kegiatan.namaKegiatan}`;
          await Promise.all(
            leaders.map((l: { userId: string }) =>
              this.notifications.create(
                l.userId,
                text,
                `/tugas-mingguan/${pen.id}`
              )
            )
          );
        }
        return;
      }

      const latest = await this.prisma.laporanHarian.findFirst({
        where: { penugasanId },
        orderBy: { tanggal: "desc" },
      });
      await this.prisma.penugasan.update({
        where: { id: penugasanId },
        data: { status: latest?.status || STATUS.BELUM },
      });
    } catch (err) {
      this.logger.error("Failed to sync penugasan status", err);
    }
  }

  private async syncTambahanStatus(tambahanId: string) {
    try {
      const tambahan = await this.prisma.kegiatanTambahan.findUnique({
        where: { id: tambahanId },
      });
      if (!tambahan) return;

      const finished = await this.prisma.laporanHarian.findFirst({
        where: { tambahanId, status: STATUS.SELESAI_DIKERJAKAN },
      });
      if (finished) {
        if (tambahan.status !== STATUS.SELESAI_DIKERJAKAN) {
          await this.prisma.kegiatanTambahan.update({
            where: { id: tambahanId },
            data: { status: STATUS.SELESAI_DIKERJAKAN },
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
        data: { status: latest?.status || STATUS.BELUM },
      });
    } catch (err) {
      this.logger.error("Failed to sync tambahan status", err);
    }
  }
  async submit(data: SubmitLaporanDto, userId: string, role: string) {
    role = normalizeRole(role);
    if (role === ROLES.PIMPINAN) {
      throw new ForbiddenException("pimpinan tidak diizinkan");
    }
    const pen = await this.prisma.penugasan.findUnique({
      where: { id: data.penugasanId },
      include: { kegiatan: true },
    });
    if (!pen) throw new NotFoundException("Penugasan tidak ditemukan");

    let targetId = data.pegawaiId ?? userId;
    if (pen.pegawaiId !== targetId) {
      if (role === ROLES.ADMIN) {
        targetId = pen.pegawaiId;
      } else if (role === ROLES.KETUA) {
        const leader = await this.prisma.member.findFirst({
          where: { teamId: pen.kegiatan.teamId, userId, isLeader: true },
        });
        if (!leader) throw new ForbiddenException("bukan penugasan anda");
        targetId = pen.pegawaiId;
      } else {
        throw new ForbiddenException("bukan penugasan anda");
      }
    }
    const laporan = await this.prisma.laporanHarian.create({
      data: {
        id: ulid(),
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
    } catch (err) {
      // Ignore sync errors so laporan is still returned
      this.logger.error("Failed to sync penugasan status", err);
    }
    await this.invalidateCache();
    return laporan;
  }

  getByTanggal(tanggal: string) {
    return this.prisma.laporanHarian.findMany({
      where: { tanggal: new Date(tanggal) },
      include: {
        pegawai: true,
        penugasan: { include: { kegiatan: true } },
        tambahan: { include: { kegiatan: true } },
      },
    });
  }

  getByUserTanggal(userId: string, tanggal: string) {
    return this.prisma.laporanHarian.findMany({
      where: { pegawaiId: userId, tanggal: new Date(tanggal) },
      include: {
        penugasan: { include: { kegiatan: true } },
        tambahan: { include: { kegiatan: true } },
      },
      orderBy: { tanggal: "desc" },
    });
  }

  getByPenugasan(penugasanId: string) {
    return this.prisma.laporanHarian.findMany({
      where: { penugasanId },
      include: {
        pegawai: true,
        penugasan: { include: { kegiatan: true } },
        tambahan: { include: { kegiatan: true } },
      },
    });
  }

  getByTambahan(tambahanId: string) {
    return this.prisma.laporanHarian.findMany({
      where: { tambahanId },
      include: {
        pegawai: true,
        penugasan: { include: { kegiatan: true } },
        tambahan: { include: { kegiatan: true } },
      },
    });
  }

  getByUser(userId: string) {
    return this.prisma.laporanHarian.findMany({
      where: { pegawaiId: userId },
      orderBy: { tanggal: "desc" },
      include: {
        penugasan: { include: { kegiatan: true } },
        tambahan: { include: { kegiatan: true } },
      },
    });
  }

  async update(id: string, data: any, userId: string, role: string) {
    role = normalizeRole(role);
    if (role === ROLES.PIMPINAN) {
      throw new ForbiddenException("pimpinan tidak diizinkan");
    }
    const existing = await this.prisma.laporanHarian.findUnique({
      where: { id },
      include: {
        penugasan: { include: { kegiatan: true } },
        tambahan: true,
      },
    });
    if (!existing) throw new NotFoundException("not found");
    if (existing.pegawaiId !== userId) {
      if (role === ROLES.ADMIN) {
        // admins can modify any report
      } else if (role === ROLES.KETUA) {
        const teamId = existing.penugasan
          ? existing.penugasan.kegiatan.teamId
          : existing.tambahan?.teamId;
        const leader = await this.prisma.member.findFirst({
          where: { teamId, userId, isLeader: true },
        });
        if (!leader) throw new ForbiddenException("bukan laporan anda");
      } else {
        throw new ForbiddenException("bukan laporan anda");
      }
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
    } catch (err) {
      this.logger.error("Failed to sync status", err);
    }
    await this.invalidateCache();
    return laporan;
  }

  async remove(id: string, userId: string, role: string) {
    role = normalizeRole(role);
    if (role === ROLES.PIMPINAN) {
      throw new ForbiddenException("pimpinan tidak diizinkan");
    }
    const existing = await this.prisma.laporanHarian.findUnique({
      where: { id },
      include: {
        penugasan: { include: { kegiatan: true } },
        tambahan: true,
      },
    });
    if (!existing) throw new NotFoundException("not found");
    if (existing.pegawaiId !== userId) {
      if (role === ROLES.ADMIN) {
        // admins can remove any report
      } else if (role === ROLES.KETUA) {
        const teamId = existing.penugasan
          ? existing.penugasan.kegiatan.teamId
          : existing.tambahan?.teamId;
        const leader = await this.prisma.member.findFirst({
          where: { teamId, userId, isLeader: true },
        });
        if (!leader) throw new ForbiddenException("bukan laporan anda");
      } else {
        throw new ForbiddenException("bukan laporan anda");
      }
    }
    await this.prisma.laporanHarian.delete({ where: { id } });

    try {
      if (existing.penugasanId)
        await this.syncPenugasanStatus(existing.penugasanId);
      if (existing.tambahanId)
        await this.syncTambahanStatus(existing.tambahanId);
    } catch (err) {
      this.logger.error("Failed to sync status", err);
    }
    await this.invalidateCache();
    return { success: true };
  }

  async getByMonthWeek(
    userId: string,
    bulan?: string,
    minggu?: number,
    includeTambahan = false
  ) {
    const where: any = { pegawaiId: userId, tambahanId: null };
    if (bulan || minggu) {
      where.penugasan = {};
      if (bulan) where.penugasan.bulan = bulan;
      if (minggu) where.penugasan.minggu = minggu;
    }
    const laporan = await this.prisma.laporanHarian.findMany({
      where,
      orderBy: { tanggal: "desc" },
      include: {
        penugasan: { include: { kegiatan: { include: { team: true } } } },
      },
    });

    const mapped = laporan.map((l: any) => ({
      ...l,
      type: "mingguan",
      penugasan: l.penugasan
        ? { ...l.penugasan, tim: l.penugasan.kegiatan.team }
        : null,
    }));

    if (!includeTambahan) return mapped;

    let tambahan = await this.prisma.kegiatanTambahan.findMany({
      where: { userId },
      include: { kegiatan: { include: { team: true } } },
    });

    if (bulan) {
      const bln = parseInt(bulan, 10);
      tambahan = tambahan.filter((t: any) => t.tanggal.getMonth() + 1 === bln);
    }
    if (minggu) {
      tambahan = tambahan.filter(
        (t: any) => getWeekOfMonth(t.tanggal) === minggu
      );
    }

    const mappedTambahan = tambahan.map((t: any) => ({
      id: t.id,
      tanggal: t.tanggal,
      status: t.status,
      deskripsi: t.deskripsi,
      capaianKegiatan: t.capaianKegiatan,
      buktiLink: t.buktiLink,
      catatan: null,
      type: "tambahan",
      penugasan: {
        kegiatan: {
          namaKegiatan: t.nama,
          deskripsi: t.kegiatan?.deskripsi,
          team: t.kegiatan?.team,
        },
        tim: t.kegiatan?.team,
      },
    }));

    return [...mapped, ...mappedTambahan].sort(
      (a, b) => b.tanggal.getTime() - a.tanggal.getTime()
    );
  }

  async export(
    userId: string,
    fileFormat: string,
    bulan?: string,
    minggu?: number,
    includeTambahan = false,
    tanggal?: string
  ) {
    const data = tanggal
      ? await this.getByUserTanggal(userId, tanggal)
      : await this.getByMonthWeek(userId, bulan, minggu, includeTambahan);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { nama: true },
    });

    const now = new Date();
    const exportDateFormatted = format(now, "d MMMM yyyy", { locale: id }); // e.g., 31 Juli 2025
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
      ? `Tanggal ${format(new Date(tanggal), "d MMMM yyyy", { locale: id })}`
      : bulan
      ? `Bulan ${months[parseInt(bulan) - 1]}${
          minggu ? ` Minggu ${minggu}` : ""
        }`
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

    const wb = new Workbook();
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
    data.sort(
      (a: any, b: any) =>
        new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );

    // Data rows
    data.forEach((d: any, idx: number) => {
      const formattedDate = format(new Date(d.tanggal), "dd-MM-yyyy");
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
}
