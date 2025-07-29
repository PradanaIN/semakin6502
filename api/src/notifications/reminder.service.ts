import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { MonitoringService } from "../monitoring/monitoring.service";
import { NotificationsService } from "./notifications.service";

@Injectable()
export class ReminderService {
  constructor(
    private monitoring: MonitoringService,
    private notifications: NotificationsService,
  ) {}

  @Cron("0 6 * * *") // every day at 06:00
  async handleCron() {
    const res = await this.monitoring.laporanTerlambat();
    const users = [...res.day1, ...res.day3, ...res.day7];
    await Promise.all(
      users.map((u) =>
        this.notifications.create(
          u.userId,
          "Anda belum mengirim laporan harian",
          "/laporan-harian",
        ),
      ),
    );
  }
}
