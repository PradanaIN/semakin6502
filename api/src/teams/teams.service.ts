import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.team.findMany({
      include: { members: { include: { user: true } } },
    });
  }

  findByLeader(userId: number) {
    return this.prisma.team.findMany({
      where: { members: { some: { userId, is_leader: true } } },
      include: { members: { include: { user: true } } },
    });
  }

  findByMember(userId: number) {
    return this.prisma.team.findMany({
      where: { members: { some: { userId } } },
      include: { members: { include: { user: true } } },
    });
  }

  findOne(id: number) {
    return this.prisma.team.findUnique({
      where: { id },
      include: { members: { include: { user: true } } },
    });
  }

  create(data: any) {
    return this.prisma.team.create({ data });
  }

  update(id: number, data: any) {
    return this.prisma.team.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.team.delete({ where: { id } });
  }

  addMember(teamId: number, member: { user_id: number; is_leader: boolean }) {
    return this.prisma.member.create({
      data: {
        teamId,
        userId: member.user_id,
        is_leader: member.is_leader,
      },
    });
  }
}
