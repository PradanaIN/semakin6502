import { Injectable, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class MasterKegiatanService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.masterKegiatan.findMany({ include: { team: true } });
  }

  async create(data: any, userId: number) {
    const leader = await this.prisma.member.findFirst({
      where: { teamId: data.teamId, userId, is_leader: true },
    });
    if (!leader) {
      throw new ForbiddenException("bukan ketua tim kegiatan ini");
    }
    return this.prisma.masterKegiatan.create({ data, include: { team: true } });
  }

  async update(id: number, data: any, userId: number) {
    const existing = await this.prisma.masterKegiatan.findUnique({
      where: { id },
    });
    if (!existing) throw new Error("not found");
    const leader = await this.prisma.member.findFirst({
      where: { teamId: existing.teamId, userId, is_leader: true },
    });
    if (!leader) throw new ForbiddenException("bukan ketua tim kegiatan ini");
    return this.prisma.masterKegiatan.update({
      where: { id },
      data,
      include: { team: true },
    });
  }

  async remove(id: number, userId: number) {
    const existing = await this.prisma.masterKegiatan.findUnique({ where: { id } });
    if (!existing) throw new Error("not found");
    const leader = await this.prisma.member.findFirst({
      where: { teamId: existing.teamId, userId, is_leader: true },
    });
    if (!leader) throw new ForbiddenException("bukan ketua tim kegiatan ini");
    return this.prisma.masterKegiatan.delete({ where: { id } });
  }
}
