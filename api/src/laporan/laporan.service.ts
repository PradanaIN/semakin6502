import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { Workbook } from "exceljs";
import PDFDocument from "pdfkit";
import { normalizeRole } from "../common/roles";
import { ROLES } from "../common/roles.constants";
import { STATUS } from "../common/status.constants";

function getWeekOfMonth(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  return Math.floor((date.getDate() + offset - 1) / 7) + 1;
}

// Semua perhitungan tanggal pada service ini mengasumsikan server
// berjalan dalam timezone UTC.

@Injectable()
export class LaporanService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  getAll() {
    return this.prisma.laporanHarian.findMany({
      orderBy: { tanggal: 'desc' },
      include: {
        pegawai: true,
        penugasan: { include: { kegiatan: true } },
      },
    });
  }

  private async syncPenugasanStatus(penugasanId: number) {
    const pen = await this.prisma.penugasan.findUnique({
      where: { id: penugasanId },
      include: { kegiatan: true },
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
        await Promise.all(
          leaders.map((l: { userId: number }) =>
            this.notifications.create(
              l.userId,
              `Penugasan ${pen.kegiatan.namaKegiatan} selesai`,
              `/tugas-mingguan/${pen.id}`,
            ),
          ),
        );
      }
      return;
    }

    const latest = await this.prisma.laporanHarian.findFirst({
      where: { penugasanId },
      orderBy: { tanggal: 'desc' },
    });
    await this.prisma.penugasan.update({
      where: { id: penugasanId },
      data: { status: latest?.status || STATUS.BELUM },
    });
  }
  async submit(data: any, userId: number, role: string) {
    role = normalizeRole(role);
    if (role === ROLES.PIMPINAN) {
      throw new ForbiddenException('pimpinan tidak diizinkan');
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
      console.error("Failed to sync penugasan status", err);
    }

    return laporan;
  }

  getByTanggal(tanggal: string) {
    return this.prisma.laporanHarian.findMany({
      where: { tanggal: new Date(tanggal) },
      include: {
        pegawai: true,
        penugasan: { include: { kegiatan: true } },
      },
    });
  }

  getByUserTanggal(userId: number, tanggal: string) {
    return this.prisma.laporanHarian.findMany({
      where: { pegawaiId: userId, tanggal: new Date(tanggal) },
      include: { penugasan: { include: { kegiatan: true } } },
      orderBy: { tanggal: 'desc' },
    });
  }

  getByPenugasan(penugasanId: number) {
    return this.prisma.laporanHarian.findMany({
      where: { penugasanId },
      include: {
        pegawai: true,
        penugasan: { include: { kegiatan: true } },
      },
    });
  }

  getByUser(userId: number) {
    return this.prisma.laporanHarian.findMany({
      where: { pegawaiId: userId },
      orderBy: { tanggal: "desc" },
      include: {
        penugasan: { include: { kegiatan: true } },
      },
    });
  }

  async update(id: number, data: any, userId: number, role: string) {
    role = normalizeRole(role);
    if (role === ROLES.PIMPINAN) {
      throw new ForbiddenException('pimpinan tidak diizinkan');
    }
    const existing = await this.prisma.laporanHarian.findUnique({
      where: { id },
      include: { penugasan: { include: { kegiatan: true } } },
    });
    if (!existing) throw new NotFoundException("not found");
    if (existing.pegawaiId !== userId) {
      if (role === ROLES.ADMIN) {
        // admins can modify any report
      } else if (role === ROLES.KETUA) {
        const leader = await this.prisma.member.findFirst({
          where: {
            teamId: existing.penugasan.kegiatan.teamId,
            userId,
            isLeader: true,
          },
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

    await this.syncPenugasanStatus(existing.penugasanId);

    return laporan;
  }

  async remove(id: number, userId: number, role: string) {
    role = normalizeRole(role);
    if (role === ROLES.PIMPINAN) {
      throw new ForbiddenException('pimpinan tidak diizinkan');
    }
    const existing = await this.prisma.laporanHarian.findUnique({
      where: { id },
      include: { penugasan: { include: { kegiatan: true } } },
    });
    if (!existing) throw new NotFoundException("not found");
    if (existing.pegawaiId !== userId) {
      if (role === ROLES.ADMIN) {
        // admins can remove any report
      } else if (role === ROLES.KETUA) {
        const leader = await this.prisma.member.findFirst({
          where: {
            teamId: existing.penugasan.kegiatan.teamId,
            userId,
            isLeader: true,
          },
        });
        if (!leader) throw new ForbiddenException("bukan laporan anda");
      } else {
        throw new ForbiddenException("bukan laporan anda");
      }
    }
    await this.prisma.laporanHarian.delete({ where: { id } });

    await this.syncPenugasanStatus(existing.penugasanId);

    return { success: true };
  }

  async getByMonthWeek(
    userId: number,
    bulan?: string,
    minggu?: number,
    includeTambahan = false,
  ) {
    const where: any = { pegawaiId: userId };
    if (bulan || minggu) {
      where.penugasan = {};
      if (bulan) where.penugasan.bulan = bulan;
      if (minggu) where.penugasan.minggu = minggu;
    }
    const laporan = await this.prisma.laporanHarian.findMany({
      where,
      orderBy: { tanggal: "desc" },
      include: { penugasan: { include: { kegiatan: { include: { team: true } } } } },
    });

    const mapped = laporan.map((l: any) => ({
      ...l,
      type: "mingguan",
      penugasan: { ...l.penugasan, tim: l.penugasan.kegiatan.team },
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
      tambahan = tambahan.filter((t: any) => getWeekOfMonth(t.tanggal) === minggu);
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
      (a, b) => b.tanggal.getTime() - a.tanggal.getTime(),
    );
  }

async export(
  userId: number,
  format: string,
  bulan?: string,
  minggu?: number,
  includeTambahan = false,
  tanggal?: string,
) {
  const data = tanggal
    ? await this.getByUserTanggal(userId, tanggal)
    : await this.getByMonthWeek(userId, bulan, minggu, includeTambahan);

  if (format === "pdf") {
    const doc = new PDFDocument({ margin: 30 });
    const buffers: Buffer[] = [];

    doc.on("data", (b: Buffer) => buffers.push(b));

    doc.text("Laporan Harian", { align: "center" });
    doc.moveDown();

    data.forEach((d: any) => {
      const label =
        d.type === "tambahan"
          ? `Tugas Tambahan - ${d.status}`
          : `Minggu ${d.penugasan.minggu} ${d.penugasan.bulan}/${d.penugasan.tahun} - ${d.status}`;

      doc
        .fontSize(10)
        .text(
          `${d.tanggal.toISOString().slice(0, 10)} - ${d.penugasan.kegiatan.namaKegiatan} - ${label}`
        );
      if (d.catatan) doc.text(`Catatan: ${d.catatan}`);
      if (d.buktiLink) doc.text(`Bukti: ${d.buktiLink}`);
      doc.moveDown();
    });

    doc.end();
    await new Promise((resolve) => doc.on("end", resolve));
    return Buffer.concat(buffers);
  } else {
    const wb = new Workbook();
    const ws = wb.addWorksheet("laporan");

    ws.columns = [
      { header: "No", width: 5 },
      { header: "Jenis", width: 15 },
      { header: "Tugas", width: 25 },
      { header: "Tanggal Laporan", width: 15 },
      { header: "Deskripsi Kegiatan", width: 40 },
      { header: "Bukti Dukung", width: 30 },
    ];

    ws.getRow(1).font = { bold: true };

    data.forEach((d: any, idx: number) => {
      ws.addRow([
        idx + 1,
        d.type === "tambahan" ? "Tambahan" : "Mingguan",
        d.penugasan.kegiatan.namaKegiatan,
        d.tanggal.toISOString().slice(0, 10),
        d.deskripsi || "",
        d.buktiLink || "",
      ]);
    });

    return await wb.xlsx.writeBuffer();
  }
}

}
