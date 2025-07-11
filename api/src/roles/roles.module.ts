import { Module } from "@nestjs/common";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [RolesController],
  providers: [PrismaService, RolesService],
})
export class RolesModule {}
