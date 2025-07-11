import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class MasterKegiatanService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.masterKegiatan.findMany();
  }

  create(data: any) {
    return this.prisma.masterKegiatan.create({ data });
  }
}
