import { MonitoringService } from '../monitoring.service';

describe('MonitoringService month boundary', () => {
  const prisma = {
    laporanHarian: { findMany: jest.fn() },
    penugasan: { findMany: jest.fn() },
  } as any;
  const cache = {
    get: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue(undefined),
    wrap: jest.fn((key, ttl, factory) => factory()),
  } as any;
  const service = new MonitoringService(prisma, cache);

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

