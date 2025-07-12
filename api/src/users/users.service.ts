import { Injectable } from "@nestjs/common";
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

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
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

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
