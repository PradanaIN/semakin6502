"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const monitoring_service_1 = require("../monitoring.service");
describe('MonitoringService month boundary', () => {
    const prisma = {
        laporanHarian: { findMany: jest.fn() },
        penugasan: { findMany: jest.fn() },
    };
    const service = new monitoring_service_1.MonitoringService(prisma);
    beforeEach(() => {
        jest.resetAllMocks();
        prisma.laporanHarian.findMany.mockResolvedValue([]);
        prisma.penugasan.findMany.mockResolvedValue([]);
    });
    it('uses original date month and week when spanning months', async () => {
        const res = await service.mingguan('2024-06-01');
        expect(prisma.penugasan.findMany).toHaveBeenCalledWith({
            where: { minggu: 1, bulan: '6', tahun: 2024 },
            select: { status: true },
        });
        expect(res.bulan).toBe('Juni');
        expect(res.bulan).not.toBe('Juli');
        expect(res.minggu).toBe(1);
    });
});
