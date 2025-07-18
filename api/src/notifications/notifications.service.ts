import { Injectable } from "@nestjs/common";

interface Notification {
  id: number;
  text: string;
  read: boolean;
}

@Injectable()
export class NotificationsService {
  private notifications: Notification[] = [
    { id: 1, text: "Laporan harian belum dikirim", read: false },
    { id: 2, text: "Penugasan baru tersedia", read: false },
    { id: 3, text: "Tim Anda telah diperbarui", read: false },
  ];

  findAll() {
    return this.notifications;
  }

  markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
  }
}
