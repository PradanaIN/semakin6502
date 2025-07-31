import { Injectable, NotFoundException } from "@nestjs/common";
import { ulid } from "ulid";
import { PrismaService } from "../prisma.service";

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

  create(data: any) {
    return this.prisma.team.create({ data: { id: ulid(), ...data } });
  }

  update(id: string, data: any) {
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
