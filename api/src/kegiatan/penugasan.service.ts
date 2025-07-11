import { Injectable, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PenugasanService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.penugasan.findMany();
  }

  async assign(data: any, userId: number) {
    const master = await this.prisma.masterKegiatan.findUnique({
      where: { id: data.kegiatanId },
    });
    if (!master) {
      throw new BadRequestException("master kegiatan tidak ditemukan");
    }
    const leader = await this.prisma.member.findFirst({
      where: { teamId: master.teamId, userId, is_leader: true },
    });
    if (!leader) {
      throw new ForbiddenException("bukan ketua tim kegiatan ini");
    }
    return this.prisma.penugasan.create({ data });
  }
}
