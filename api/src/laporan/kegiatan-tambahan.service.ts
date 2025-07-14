import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class TambahanService {
  constructor(private prisma: PrismaService) {}
  async add(data: any) {
    const master = await this.prisma.masterKegiatan.findUnique({
      where: { id: data.kegiatanId },
    });
    if (!master) throw new BadRequestException('master kegiatan tidak ditemukan');
    return this.prisma.kegiatanTambahan.create({
      data: {
        nama: master.nama_kegiatan,
        tanggal: new Date(data.tanggal),
        status: data.status,
        bukti_link: data.bukti_link,
        deskripsi: data.deskripsi,
        tanggal_selesai: data.tanggal_selesai ? new Date(data.tanggal_selesai) : undefined,
        tanggal_selesai_akhir: data.tanggal_selesai_akhir ? new Date(data.tanggal_selesai_akhir) : undefined,
        userId: data.userId,
        kegiatanId: master.id,
        teamId: master.teamId,
      },
      include: { kegiatan: { include: { team: true } } },
    });
  }

  getByUser(userId: number) {
    return this.prisma.kegiatanTambahan.findMany({
      where: { userId },
      include: { kegiatan: { include: { team: true } } },
    });
  }

  getOne(id: number, userId: number) {
    return this.prisma.kegiatanTambahan.findFirst({
      where: { id, userId },
      include: { kegiatan: { include: { team: true } } },
    });
  }

  async update(id: number, data: any, userId: number) {
    const updateData: any = { ...data };
    if (data.kegiatanId) {
      const master = await this.prisma.masterKegiatan.findUnique({
        where: { id: data.kegiatanId },
      });
      if (!master) throw new BadRequestException('master kegiatan tidak ditemukan');
      updateData.nama = master.nama_kegiatan;
      updateData.teamId = master.teamId;
    }
    return this.prisma.kegiatanTambahan.update({
      where: { id, userId },
      data: updateData,
      include: { kegiatan: { include: { team: true } } },
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.kegiatanTambahan.delete({ where: { id, userId } });
  }
}
