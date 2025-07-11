import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

@Injectable()
export class TambahanService {
  add(data: any) {
    return prisma.kegiatanTambahan.create({ data });
  }

  getByUser(userId: number) {
    return prisma.kegiatanTambahan.findMany({ where: { userId } });
  }
}
