import { MonitoringService } from '../src/monitoring/monitoring.service';
import { STATUS } from '../src/common/status.constants';

describe('MonitoringService aggregated', () => {
  const prisma = {
    laporanHarian: { findMany: jest.fn() },
    penugasan: { findMany: jest.fn() },
  } as any;
  const service = new MonitoringService(prisma);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('harianAll aggregates and sorts by name', async () => {
    prisma.laporanHarian.findMany.mockResolvedValue([
      { pegawaiId: 2, status: STATUS.SELESAI_DIKERJAKAN, pegawai: { nama: 'B' } },
      { pegawaiId: 1, status: STATUS.BELUM, pegawai: { nama: 'A' } },
      { pegawaiId: 1, status: STATUS.SELESAI_DIKERJAKAN, pegawai: { nama: 'A' } },
    ]);
    const res = await service.harianAll('2024-05-01');
    expect(res).toEqual([
      { userId: 1, nama: 'A', selesai: 1, total: 2, persen: 50 },
      { userId: 2, nama: 'B', selesai: 1, total: 1, persen: 100 },
    ]);
  });

  it('mingguanAll aggregates and sorts', async () => {
    prisma.laporanHarian.findMany.mockResolvedValue([
      { pegawaiId: 2, status: STATUS.SELESAI_DIKERJAKAN, pegawai: { nama: 'B' } },
      { pegawaiId: 1, status: STATUS.BELUM, pegawai: { nama: 'A' } },
      { pegawaiId: 1, status: STATUS.SELESAI_DIKERJAKAN, pegawai: { nama: 'A' } },
    ]);
    const res = await service.mingguanAll('2024-05-01');
    expect(res).toEqual([
      { userId: 1, nama: 'A', selesai: 1, total: 2, persen: 50 },
      { userId: 2, nama: 'B', selesai: 1, total: 1, persen: 100 },
    ]);
  });

  it('bulananAll aggregates and sorts', async () => {
    prisma.penugasan.findMany.mockResolvedValue([
      { pegawaiId: 2, status: STATUS.SELESAI_DIKERJAKAN, pegawai: { nama: 'B' } },
      { pegawaiId: 1, status: STATUS.BELUM, pegawai: { nama: 'A' } },
      { pegawaiId: 1, status: STATUS.SELESAI_DIKERJAKAN, pegawai: { nama: 'A' } },
    ]);
    const res = await service.bulananAll('2024');
    expect(res).toEqual([
      { userId: 1, nama: 'A', selesai: 1, total: 2, persen: 50 },
      { userId: 2, nama: 'B', selesai: 1, total: 1, persen: 100 },
    ]);
  });
});
