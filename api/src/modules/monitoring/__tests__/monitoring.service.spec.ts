import { STATUS } from '../../../shared/constants/status.constants';
import { MonitoringService } from '../monitoring.service';

describe('MonitoringService', () => {
  const prisma = {
    laporanHarian: { findMany: jest.fn() },
    penugasan: { findMany: jest.fn() },
    user: { findMany: jest.fn() },
  } as any;
  const cache = { get: jest.fn(), set: jest.fn() } as any;

  let service: MonitoringService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.laporanHarian.findMany.mockResolvedValue([]);
    prisma.penugasan.findMany.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([]);
    cache.get.mockResolvedValue(null);
    cache.set.mockResolvedValue(undefined);
    service = new MonitoringService(prisma, cache);
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

  it('calculates daily completion percentage based on selesai vs total', async () => {
    prisma.laporanHarian.findMany.mockResolvedValue([
      {
        tanggal: new Date('2024-06-03T00:00:00.000Z'),
        status: STATUS.SELESAI_DIKERJAKAN,
      },
      {
        tanggal: new Date('2024-06-03T00:00:00.000Z'),
        status: STATUS.BELUM,
      },
      {
        tanggal: new Date('2024-06-04T00:00:00.000Z'),
        status: STATUS.SELESAI_DIKERJAKAN,
      },
    ]);

    const res = await service.mingguan('2024-06-05T00:00:00.000Z');
    const detail = res.detail as Array<{ hari: string; persen: number }>;
    const monday = detail.find((d) => d.hari === 'Senin');
    const tuesday = detail.find((d) => d.hari === 'Selasa');
    expect(monday?.persen).toBe(50);
    expect(tuesday?.persen).toBe(100);
  });

  it('derives weekly completion percentage for each user', async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: 'u1', nama: 'User 1' },
    ]);
    prisma.laporanHarian.findMany.mockResolvedValue([
      {
        pegawaiId: 'u1',
        tanggal: new Date('2024-06-03T00:00:00.000Z'),
        status: STATUS.SELESAI_DIKERJAKAN,
      },
      {
        pegawaiId: 'u1',
        tanggal: new Date('2024-06-04T00:00:00.000Z'),
        status: STATUS.BELUM,
      },
    ]);

    const res = await service.mingguanBulan('2024-06-15T00:00:00.000Z');
    expect(res[0].weeks[1].total).toBe(2);
    expect(res[0].weeks[1].selesai).toBe(1);
    expect(res[0].weeks[1].persen).toBe(50);
  });
});
