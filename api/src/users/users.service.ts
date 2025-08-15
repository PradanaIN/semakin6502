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
  findAll() {
    return this.prisma.user.findMany({
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
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    if (!data.username && data.email) {
      data.username = data.email.split("@")[0];
    }
    return this.prisma.user.create({
      data: { id: ulid(), ...data, phone: data.phone },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    if (data.email) {
      data.username = data.email.split("@")[0];
    }
    return this.prisma.user.update({
      where: { id },
      data: { ...data, phone: data.phone },
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
    if (data.email) {
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
