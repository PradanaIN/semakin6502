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
}
