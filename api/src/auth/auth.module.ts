// auth.module.ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaService } from "../prisma.service"; // ⬅ Import manual

@Module({
  imports: [JwtModule.register({ secret: "your_secret_key" })],
  controllers: [AuthController],
  providers: [AuthService, PrismaService], // ⬅ Tambahkan ini
  exports: [AuthService],
})
export class AuthModule {}
