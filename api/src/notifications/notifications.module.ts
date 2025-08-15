import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { PrismaService } from "../prisma.service";
import { ReminderService } from "./reminder.service";
import { MonitoringModule } from "../monitoring/monitoring.module";
import { WhatsappService } from "./whatsapp.service";

@Module({
  imports: [MonitoringModule],
  controllers: [NotificationsController],
  providers: [PrismaService, NotificationsService, ReminderService, WhatsappService],
  exports: [NotificationsService, WhatsappService],
})
export class NotificationsModule {}
