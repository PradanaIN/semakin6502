import { Injectable, UnauthorizedException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@core/database/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  async login(identifier: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      select: {
        id: true,
        nama: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        password: true,
        members: {
          select: { teamId: true, team: { select: { namaTim: true } } },
        },
      },
    });
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException("Invalid credentials");

    const payload = { sub: user.id, role: user.role };
    const member = user.members?.[0];
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        teamId: member?.teamId,
        teamName: member?.team?.namaTim,
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { members: { include: { team: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    const member = user.members?.[0];
    const sanitized: any = {
      ...user,
      teamId: member?.teamId,
      teamName: member?.team?.namaTim,
    };
    delete sanitized.password;
    return sanitized;
  }
}
