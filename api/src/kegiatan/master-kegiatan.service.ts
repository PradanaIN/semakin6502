import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { ulid } from "ulid";
import { PrismaService } from "../prisma.service";
import { ROLES } from "../common/roles.constants";
import { CreateMasterKegiatanDto } from "./dto/create-master-kegiatan.dto";
import { UpdateMasterKegiatanDto } from "./dto/update-master-kegiatan.dto";

@Injectable()
export class MasterKegiatanService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    teamId?: string;
    search?: string;
  }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (params.teamId) where.teamId = params.teamId;
    if (params.search) where.namaKegiatan = { contains: params.search };

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

  async create(data: CreateMasterKegiatanDto, userId: string, role: string) {
    if (role !== ROLES.ADMIN) {
      const leader = await this.prisma.member.findFirst({
        where: { teamId: data.teamId, userId, isLeader: true },
      });
      if (!leader) {
        throw new ForbiddenException("bukan ketua tim kegiatan ini");
      }
    }
    return this.prisma.masterKegiatan.create({
      data: { id: ulid(), ...data },
      include: { team: true },
    });
  }

  async update(
    id: string,
    data: UpdateMasterKegiatanDto,
    userId: string,
    role: string,
  ) {
    const existing = await this.prisma.masterKegiatan.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException("not found");
    if (role !== ROLES.ADMIN) {
      const leader = await this.prisma.member.findFirst({
        where: { teamId: existing.teamId, userId, isLeader: true },
      });
      if (!leader) throw new ForbiddenException("bukan ketua tim kegiatan ini");
    }
    return this.prisma.masterKegiatan.update({
      where: { id },
      data,
      include: { team: true },
    });
  }

  async remove(id: string, userId: string, role: string) {
    const existing = await this.prisma.masterKegiatan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("not found");
    if (role !== ROLES.ADMIN) {
      const leader = await this.prisma.member.findFirst({
        where: { teamId: existing.teamId, userId, isLeader: true },
      });
      if (!leader) throw new ForbiddenException("bukan ketua tim kegiatan ini");
    }
    return this.prisma.masterKegiatan.delete({ where: { id } });
  }
}
