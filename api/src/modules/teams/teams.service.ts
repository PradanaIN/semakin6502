import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ulid } from "ulid";
import { PrismaService } from "@core/database/prisma.service";

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.team.findMany({
      include: { members: { include: { user: true } } },
    });
  }

  findAllPublic() {
    return this.prisma.team.findMany({
      where: { namaTim: { notIn: ["Admin", "Pimpinan"] } },
      include: { members: { include: { user: true } } },
    });
  }

  findByLeader(userId: string) {
    return this.prisma.team.findMany({
      where: { members: { some: { userId, isLeader: true } } },
      include: { members: { include: { user: true } } },
    });
  }

  findByMember(userId: string) {
    return this.prisma.team.findMany({
      where: { members: { some: { userId } } },
      include: { members: { include: { user: true } } },
    });
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: { members: { include: { user: true } } },
    });
    if (!team) throw new NotFoundException("not found");
    return team;
  }

  async create(data: any) {
    const namaTim = data?.namaTim;
    if (namaTim) {
      const existing = await this.prisma.team.findFirst({
        where: {
          namaTim,
        },
      });
      if (existing) {
        throw new ConflictException("Nama tim sudah ada");
      }
    }

    return this.prisma.team.create({ data: { id: ulid(), ...data } });
  }

  async update(id: string, data: any) {
    const namaTim = data?.namaTim;
    if (namaTim) {
      const existing = await this.prisma.team.findFirst({
        where: {
          namaTim,
          id: { not: id },
        },
      });
      if (existing) {
        throw new ConflictException("Nama tim sudah ada");
      }
    }

    return this.prisma.team.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.team.delete({ where: { id } });
  }

  addMember(teamId: string, member: { user_id: string; isLeader: boolean }) {
    return this.prisma.member.create({
      data: {
        id: ulid(),
        teamId,
        userId: member.user_id,
        isLeader: member.isLeader,
      },
    });
  }
}
