import { Injectable, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class LaporanService {
  constructor(private prisma: PrismaService) {}
  async submit(data: any) {
    const pen = await this.prisma.penugasan.findUnique({
      where: { id: data.penugasanId },
    });
    if (!pen) throw new BadRequestException("Penugasan tidak ditemukan");
    if (pen.pegawaiId !== data.pegawaiId)
      throw new ForbiddenException("bukan penugasan anda");
    return this.prisma.laporanHarian.create({ data });
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
}
