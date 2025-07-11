import { Injectable, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class MasterKegiatanService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.masterKegiatan.findMany();
  }

  async create(data: any, userId: number) {
    const leader = await this.prisma.member.findFirst({
      where: { teamId: data.teamId, userId, is_leader: true },
    });
    if (!leader) {
      throw new ForbiddenException("bukan ketua tim kegiatan ini");
    }
    return this.prisma.masterKegiatan.create({ data });
  }
}
