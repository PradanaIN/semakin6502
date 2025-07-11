import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class MonitoringService {
  constructor(private prisma: PrismaService) {}
  harian(tanggal: string) {
    return this.prisma.laporanHarian.findMany({
      where: { tanggal: new Date(tanggal) },
    });
  }

  mingguan(minggu: string) {
    // Asumsikan minggu format "2025-06-01"
    return this.prisma.laporanHarian.findMany({
      where: {
        tanggal: {
          gte: new Date(minggu),
        },
      },
    });
  }

  bulanan(bulan: string) {
    return this.prisma.laporanHarian.findMany({
      where: {
        tanggal: {
          gte: new Date(`${bulan}-01`),
        },
      },
    });
  }
}
