import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/database/prisma.service";

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany();
  }
}
