import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

@Injectable()
export class MasterKegiatanService {
  findAll() {
    return prisma.masterKegiatan.findMany();
  }

  create(data: any) {
    return prisma.masterKegiatan.create({ data });
  }
}
