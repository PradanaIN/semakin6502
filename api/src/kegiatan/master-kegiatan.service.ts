import { Injectable, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateMasterKegiatanDto } from "./dto/create-master-kegiatan.dto";
import { UpdateMasterKegiatanDto } from "./dto/update-master-kegiatan.dto";

@Injectable()
export class MasterKegiatanService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    teamId?: number;
    search?: string;
  }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (params.teamId) where.teamId = params.teamId;
    if (params.search) where.nama_kegiatan = { contains: params.search };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.masterKegiatan.findMany({
        where,
        include: { team: true },
        skip,
        take: limit,
      }),
      this.prisma.masterKegiatan.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async create(data: CreateMasterKegiatanDto, userId: number, role: string) {
    if (role !== "admin") {
      const leader = await this.prisma.member.findFirst({
        where: { teamId: data.teamId, userId, is_leader: true },
      });
      if (!leader) {
        throw new ForbiddenException("bukan ketua tim kegiatan ini");
      }
    }
    return this.prisma.masterKegiatan.create({ data, include: { team: true } });
  }

  async update(
    id: number,
    data: UpdateMasterKegiatanDto,
    userId: number,
    role: string,
  ) {
    const existing = await this.prisma.masterKegiatan.findUnique({
      where: { id },
    });
    if (!existing) throw new Error("not found");
    if (role !== "admin") {
      const leader = await this.prisma.member.findFirst({
        where: { teamId: existing.teamId, userId, is_leader: true },
      });
      if (!leader) throw new ForbiddenException("bukan ketua tim kegiatan ini");
    }
    return this.prisma.masterKegiatan.update({
      where: { id },
      data,
      include: { team: true },
    });
  }

  async remove(id: number, userId: number, role: string) {
    const existing = await this.prisma.masterKegiatan.findUnique({ where: { id } });
    if (!existing) throw new Error("not found");
    if (role !== "admin") {
      const leader = await this.prisma.member.findFirst({
        where: { teamId: existing.teamId, userId, is_leader: true },
      });
      if (!leader) throw new ForbiddenException("bukan ketua tim kegiatan ini");
    }
    return this.prisma.masterKegiatan.delete({ where: { id } });
  }
}
