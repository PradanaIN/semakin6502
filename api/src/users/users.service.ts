import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

@Injectable()
export class UsersService {
  findAll() {
    return prisma.user.findMany();
  }

  findOne(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }

  create(data: any) {
    return prisma.user.create({ data });
  }

  update(id: number, data: any) {
    return prisma.user.update({ where: { id }, data });
  }

  remove(id: number) {
    return prisma.user.delete({ where: { id } });
  }
}
