import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class LaporanService {
  constructor(private prisma: PrismaService) {}
  submit(data: any) {
    return this.prisma.laporanHarian.create({ data });
  }

  getByTanggal(tanggal: string) {
    return this.prisma.laporanHarian.findMany({
      where: { tanggal: new Date(tanggal) },
    });
  }
}
