import { Module } from "@nestjs/common";
import { MonitoringController } from "./monitoring.controller";
import { MonitoringService } from "./monitoring.service";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [MonitoringController],
  providers: [PrismaService, MonitoringService],
  exports: [MonitoringService],
})
// Module providing monitoring related services
export class MonitoringModule {}
