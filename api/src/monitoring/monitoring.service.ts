import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

@Injectable()
export class MonitoringService {
  harian(tanggal: string) {
    return prisma.laporanHarian.findMany({
      where: { tanggal: new Date(tanggal) },
    });
  }

  mingguan(minggu: string) {
    // Asumsikan minggu format "2025-06-01"
    return prisma.laporanHarian.findMany({
      where: {
        tanggal: {
          gte: new Date(minggu),
        },
      },
    });
  }

  bulanan(bulan: string) {
    return prisma.laporanHarian.findMany({
      where: {
        tanggal: {
          gte: new Date(`${bulan}-01`),
        },
      },
    });
  }
}
