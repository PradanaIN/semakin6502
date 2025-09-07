import { Injectable, NotFoundException } from "@nestjs/common";
import { ulid } from "ulid";
import { PrismaService } from "../prisma.service";
import { hashPassword } from "../common/hash";
import type { Prisma, User } from "@prisma/client";
import { CreateUserDto } from "./create-user.dto";
import { UpdateUserDto } from "./update-user.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  findAll(page = 1, pageSize = 10) {
    const p = page > 0 ? page : 1;
    const ps = pageSize > 0 ? pageSize : 10;
    return this.prisma.user.findMany({
      skip: (p - 1) * ps,
      take: ps,
      include: {
        members: { include: { team: true } },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("not found");
    return user;
  }

  async create(data: CreateUserDto) {
    const { teamId, ...rest } = data;
    if (rest.password) {
      rest.password = await hashPassword(rest.password);
    }
    if (!rest.username && rest.email) {
      rest.username = rest.email.split("@")[0];
    }
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { id: ulid(), ...rest, phone: rest.phone },
      });
      if (teamId) {
        await tx.member.create({
          data: { id: ulid(), userId: user.id, teamId, isLeader: false },
        });
      }
      return user;
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const { teamId, ...rest } = data;
    if (rest.password) {
      rest.password = await hashPassword(rest.password);
    }
    if (rest.email) {
      rest.username = rest.email.split("@")[0];
    }
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { ...rest, phone: rest.phone },
      });
      const existing = await tx.member.findFirst({ where: { userId: id } });
      if (teamId) {
        if (existing) {
          await tx.member.update({
            where: { id: existing.id },
            data: { teamId },
          });
        } else {
          await tx.member.create({
            data: { id: ulid(), userId: id, teamId, isLeader: false },
          });
        }
      } else if (existing) {
        await tx.member.delete({ where: { id: existing.id } });
      }
      return user;
    });
  }

  async findProfile(id: string) {
    type UserWithMembers = Prisma.UserGetPayload<{
      include: { members: { include: { team: true } } };
    }>;
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { members: { include: { team: true } } },
    });
    if (!user) throw new NotFoundException("not found");
    const member = (user as UserWithMembers).members?.[0];
    const { password: _password, members, ...rest } = user as UserWithMembers;
    const sanitized: Omit<User, "password"> & {
      teamId?: string;
      teamName?: string;
    } = {
      ...rest,
      teamId: member?.teamId,
      teamName: member?.team?.namaTim,
    };
    return sanitized;
  }

  async updateProfile(id: string, data: UpdateUserDto) {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    // Jangan paksa username menjadi bagian dari email; hormati input eksplisit
    if (data.email && !data.username) {
      data.username = data.email.split("@")[0];
    }
    const user = await this.prisma.user.update({
      where: { id },
      data: { ...data, phone: data.phone },
    });
    const member = await this.prisma.member.findFirst({
      where: { userId: id },
      include: { team: true },
    });
    const { password: _password, ...rest } = user;
    const sanitized: Omit<User, "password"> & {
      teamId?: string;
      teamName?: string;
    } = {
      ...rest,
      teamId: member?.teamId,
      teamName: member?.team?.namaTim,
    };
    return sanitized;
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
