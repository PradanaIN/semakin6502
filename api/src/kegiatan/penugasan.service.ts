import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PenugasanService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.penugasan.findMany();
  }

  assign(data: any) {
    return this.prisma.penugasan.create({ data });
  }
}
