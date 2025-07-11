import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

@Injectable()
export class PenugasanService {
  findAll() {
    return prisma.penugasan.findMany();
  }

  assign(data: any) {
    return prisma.penugasan.create({ data });
  }
}
