import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

@Injectable()
export class LaporanService {
  submit(data: any) {
    return prisma.laporanHarian.create({ data });
  }

  getByTanggal(tanggal: string) {
    return prisma.laporanHarian.findMany({
      where: { tanggal: new Date(tanggal) },
    });
  }
}
