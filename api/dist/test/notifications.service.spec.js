"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notifications_service_1 = require("../src/notifications/notifications.service");
const reminder_service_1 = require("../src/notifications/reminder.service");
jest.mock('ulid', () => ({ ulid: () => '1' }));
const prisma = {
    notification: {
        create: jest.fn(),
    },
};
const notifications = new notifications_service_1.NotificationsService(prisma);
beforeEach(() => {
    jest.resetAllMocks();
});
describe('NotificationsService create', () => {
    it('creates notification with given data', async () => {
        prisma.notification.create.mockResolvedValue({ id: '1' });
        const res = await notifications.create('u1', 'text', '/link');
        expect(prisma.notification.create).toHaveBeenCalledWith({
            data: { id: '1', userId: 'u1', text: 'text', link: '/link' },
        });
        expect(res).toEqual({ id: '1' });
    });
});
describe('ReminderService handleCron', () => {
    it('creates notifications for overdue reports', async () => {
        const monitoring = {
            laporanTerlambat: jest.fn().mockResolvedValue({
                day1: [{ userId: 'u1' }],
                day3: [{ userId: 'u2' }],
                day7: [{ userId: 'u3' }],
            }),
        };
        prisma.notification.create.mockResolvedValue({});
        const reminder = new reminder_service_1.ReminderService(monitoring, notifications);
        await reminder.handleCron();
        expect(monitoring.laporanTerlambat).toHaveBeenCalled();
        expect(prisma.notification.create).toHaveBeenCalledTimes(3);
        expect(prisma.notification.create).toHaveBeenCalledWith({
            data: {
                id: '1',
                userId: 'u1',
                text: 'Anda belum mengirim laporan harian',
                link: '/laporan-harian',
            },
        });
    });
});
