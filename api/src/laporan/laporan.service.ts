import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Workbook } from "exceljs";
import PDFDocument from "pdfkit";
import { normalizeRole } from "../common/roles";
import { ROLES } from "../common/roles.constants";
import { STATUS } from "../common/status.constants";

@Injectable()
export class LaporanService {
  constructor(private prisma: PrismaService) {}

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
        deskripsi: data.deskripsi,
        buktiLink: data.buktiLink || undefined,
        catatan: data.catatan || undefined,
      },
    });

    await this.syncPenugasanStatus(data.penugasanId);

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

  async export(userId: number, format: string) {
    const data = await this.getByUser(userId);
    if (format === "pdf") {
      const doc = new PDFDocument({ margin: 30 });
      const buffers: Buffer[] = [];
      doc.on("data", (b: Buffer) => buffers.push(b));
      doc.text("Laporan Harian", { align: "center" });
      doc.moveDown();
      data.forEach((d: any) => {
        doc
          .fontSize(10)
          .text(
            `${d.tanggal.toISOString().slice(0, 10)} - ${d.penugasan.kegiatan.namaKegiatan} - Minggu ${d.penugasan.minggu} ${d.penugasan.bulan}/${d.penugasan.tahun} - ${d.status}`
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
      ws.addRow([
        "Tanggal",
        "Kegiatan",
        "Minggu",
        "Bulan",
        "Tahun",
        "Status",
        "Bukti",
        "Catatan",
      ]);
      data.forEach((d: any) => {
        ws.addRow([
          d.tanggal.toISOString().slice(0, 10),
          d.penugasan.kegiatan.namaKegiatan,
          d.penugasan.minggu,
          d.penugasan.bulan,
          d.penugasan.tahun,
          d.status,
          d.buktiLink || "",
          d.catatan || "",
        ]);
      });
      return await wb.xlsx.writeBuffer();
    }
  }
}
