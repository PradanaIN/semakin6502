import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

@Injectable()
export class TeamsService {
  findAll() {
    return prisma.team.findMany({ include: { members: true } });
  }

  findOne(id: number) {
    return prisma.team.findUnique({
      where: { id },
      include: { members: true },
    });
  }

  create(data: any) {
    return prisma.team.create({ data });
  }

  update(id: number, data: any) {
    return prisma.team.update({ where: { id }, data });
  }

  remove(id: number) {
    return prisma.team.delete({ where: { id } });
  }

  addMember(teamId: number, member: { user_id: number; is_leader: boolean }) {
    return prisma.member.create({
      data: {
        teamId,
        userId: member.user_id,
        is_leader: member.is_leader,
      },
    });
  }
}
