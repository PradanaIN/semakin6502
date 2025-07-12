import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  async login(identifier: string, password: string) {
    const where = identifier.includes("@")
      ? { email: identifier }
      : { username: identifier };
    const user = await this.prisma.user.findUnique({ where });
    if (!user) throw new UnauthorizedException("Email/Username tidak ditemukan");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException("Password salah");

    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
