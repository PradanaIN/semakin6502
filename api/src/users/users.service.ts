import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { hashPassword } from "../common/hash";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.user.findMany({
      include: {
        members: { include: { team: true } },
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("not found");
    return user;
  }

  async create(data: any) {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    if (!data.username && data.email) {
      data.username = data.email.split("@")[0];
    }
    return this.prisma.user.create({ data });
  }

  async update(id: number, data: any) {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    if (data.email) {
      data.username = data.email.split("@")[0];
    }
    return this.prisma.user.update({ where: { id }, data });
  }

  async findProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { members: { include: { team: true } } },
    });
    if (!user) throw new NotFoundException("not found");
    const member = user.members?.[0];
    const sanitized: any = {
      ...user,
      teamId: member?.teamId,
      teamName: member?.team?.namaTim,
    };
    delete sanitized.password;
    return sanitized;
  }

  async updateProfile(id: number, data: any) {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    if (data.email) {
      data.username = data.email.split("@")[0];
    }
    const user = await this.prisma.user.update({ where: { id }, data });
    const member = await this.prisma.member.findFirst({
      where: { userId: id },
      include: { team: true },
    });
    const sanitized: any = {
      ...user,
      teamId: member?.teamId,
      teamName: member?.team?.namaTim,
    };
    delete sanitized.password;
    return sanitized;
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
