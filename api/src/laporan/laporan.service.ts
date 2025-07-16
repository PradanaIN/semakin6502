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

@Injectable()
export class LaporanService {
  constructor(private prisma: PrismaService) {}
  async submit(data: any) {
    const pen = await this.prisma.penugasan.findUnique({
      where: { id: data.penugasanId },
    });
    if (!pen) throw new NotFoundException("Penugasan tidak ditemukan");
    if (pen.pegawaiId !== data.pegawaiId)
      throw new ForbiddenException("bukan penugasan anda");
    return this.prisma.laporanHarian.create({
      data: {
        penugasanId: data.penugasanId,
        pegawaiId: data.pegawaiId,
        tanggal: new Date(data.tanggal),
        status: data.status,
        deskripsi: data.deskripsi,
        bukti_link: data.bukti_link || undefined,
        catatan: data.catatan || undefined,
      },
    });
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
            is_leader: true,
          },
        });
        if (!leader) throw new ForbiddenException("bukan laporan anda");
      } else {
        throw new ForbiddenException("bukan laporan anda");
      }
    }
    return this.prisma.laporanHarian.update({
      where: { id },
      data: {
        tanggal: new Date(data.tanggal),
        status: data.status,
        deskripsi: data.deskripsi,
        bukti_link: data.bukti_link,
        catatan: data.catatan,
      },
    });
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
            is_leader: true,
          },
        });
        if (!leader) throw new ForbiddenException("bukan laporan anda");
      } else {
        throw new ForbiddenException("bukan laporan anda");
      }
    }
    await this.prisma.laporanHarian.delete({ where: { id } });
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
            `${d.tanggal.toISOString().slice(0, 10)} - ${d.penugasan.kegiatan.nama_kegiatan} - Minggu ${d.penugasan.minggu} ${d.penugasan.bulan}/${d.penugasan.tahun} - ${d.status}`
          );
        if (d.catatan) doc.text(`Catatan: ${d.catatan}`);
        if (d.bukti_link) doc.text(`Bukti: ${d.bukti_link}`);
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
          d.penugasan.kegiatan.nama_kegiatan,
          d.penugasan.minggu,
          d.penugasan.bulan,
          d.penugasan.tahun,
          d.status,
          d.bukti_link || "",
          d.catatan || "",
        ]);
      });
      return await wb.xlsx.writeBuffer();
    }
  }
}
