import { Injectable, UnauthorizedException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  async login(identifier: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      include: { members: { include: { team: true } } },
    });
    if (!user) throw new UnauthorizedException("User tidak ditemukan");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException("Password salah");

    const payload = { sub: user.id, role: user.role };
    const member = user.members?.[0];
    const sanitized = {
      ...user,
      teamId: member?.teamId,
      teamName: member?.team?.namaTim,
    } as any;
    delete (sanitized as any).password;
    return {
      access_token: this.jwtService.sign(payload),
      user: sanitized,
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
