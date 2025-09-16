import { Module } from "@nestjs/common";
import { MonitoringController } from "./monitoring.controller";
import { MonitoringService } from "./monitoring.service";
import { MonitoringAccessService } from "./services/monitoring-access.service";
import { MonitoringCacheService } from "./services/monitoring-cache.service";

@Module({
  controllers: [MonitoringController],
  providers: [MonitoringCacheService, MonitoringAccessService, MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
