import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class TambahanService {
  constructor(private prisma: PrismaService) {}
  add(data: any) {
    return this.prisma.kegiatanTambahan.create({ data });
  }

  getByUser(userId: number) {
    return this.prisma.kegiatanTambahan.findMany({ where: { userId } });
  }

  getOne(id: number, userId: number) {
    return this.prisma.kegiatanTambahan.findFirst({ where: { id, userId } });
  }

  update(id: number, data: any, userId: number) {
    return this.prisma.kegiatanTambahan.update({
      where: { id, userId },
      data,
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.kegiatanTambahan.delete({ where: { id, userId } });
  }
}
