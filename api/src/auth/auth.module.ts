// auth.module.ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaService } from "../prisma.service"; // ⬅ Import manual
import { JwtStrategy } from "./jwt.strategy";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  // Fail fast when JWT_SECRET is missing
  throw new Error("JWT_SECRET environment variable is required");
}

@Module({
  imports: [
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
