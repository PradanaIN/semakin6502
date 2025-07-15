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

  it('bulananAll aggregates and can filter by month', async () => {
    prisma.penugasan.findMany.mockResolvedValue([
      { pegawaiId: 2, bulan: '1', status: STATUS.SELESAI_DIKERJAKAN, pegawai: { nama: 'B' } },
      { pegawaiId: 1, bulan: '2', status: STATUS.BELUM, pegawai: { nama: 'A' } },
      { pegawaiId: 1, bulan: '1', status: STATUS.SELESAI_DIKERJAKAN, pegawai: { nama: 'A' } },
    ]);
    const res = await service.bulananAll('2024', undefined, '1');
    expect(res).toEqual([
      { userId: 1, nama: 'A', selesai: 1, total: 1, persen: 100 },
      { userId: 2, nama: 'B', selesai: 1, total: 1, persen: 100 },
    ]);
  });

  it('harianBulan groups by user and marks days', async () => {
    prisma.laporanHarian.findMany.mockResolvedValue([
      { pegawaiId: 1, tanggal: new Date('2024-05-02'), pegawai: { nama: 'A' } },
      { pegawaiId: 2, tanggal: new Date('2024-05-01'), pegawai: { nama: 'B' } },
    ]);
    const res = await service.harianBulan('2024-05-10');
    expect(res.map((u) => u.nama)).toEqual(['A', 'B']);
    expect(res[0].detail.length).toBe(31);
    expect(res[0].detail[1]).toEqual({ tanggal: '2024-05-02', adaKegiatan: true });
    expect(res[1].detail[0]).toEqual({ tanggal: '2024-05-01', adaKegiatan: true });
  });

  it('mingguanBulan aggregates per week', async () => {
    prisma.laporanHarian.findMany.mockResolvedValue([
      {
        pegawaiId: 1,
        tanggal: new Date('2024-05-02'),
        status: STATUS.SELESAI_DIKERJAKAN,
        pegawai: { nama: 'A' },
      },
      {
        pegawaiId: 1,
        tanggal: new Date('2024-05-08'),
        status: STATUS.BELUM,
        pegawai: { nama: 'A' },
      },
      {
        pegawaiId: 2,
        tanggal: new Date('2024-05-15'),
        status: STATUS.SELESAI_DIKERJAKAN,
        pegawai: { nama: 'B' },
      },
    ]);
    const res = await service.mingguanBulan('2024-05-10');
    expect(res).toEqual([
      {
        userId: 1,
        nama: 'A',
        weeks: [
          { selesai: 1, total: 1, persen: 100 },
          { selesai: 0, total: 1, persen: 0 },
          { selesai: 0, total: 0, persen: 0 },
          { selesai: 0, total: 0, persen: 0 },
          { selesai: 0, total: 0, persen: 0 },
        ],
      },
      {
        userId: 2,
        nama: 'B',
        weeks: [
          { selesai: 0, total: 0, persen: 0 },
          { selesai: 0, total: 0, persen: 0 },
          { selesai: 1, total: 1, persen: 100 },
          { selesai: 0, total: 0, persen: 0 },
          { selesai: 0, total: 0, persen: 0 },
        ],
      },
    ]);
  });

  it('bulananMatrix aggregates per month', async () => {
    prisma.penugasan.findMany.mockResolvedValue([
      {
        pegawaiId: 1,
        bulan: '1',
        status: STATUS.SELESAI_DIKERJAKAN,
        pegawai: { nama: 'A' },
      },
      {
        pegawaiId: 1,
        bulan: '2',
        status: STATUS.BELUM,
        pegawai: { nama: 'A' },
      },
      {
        pegawaiId: 2,
        bulan: '1',
        status: STATUS.SELESAI_DIKERJAKAN,
        pegawai: { nama: 'B' },
      },
    ]);

    const res = await service.bulananMatrix('2024');
    const zero = { selesai: 0, total: 0, persen: 0 };
    expect(res).toEqual([
      {
        userId: 1,
        nama: 'A',
        months: [
          { selesai: 1, total: 1, persen: 100 },
          { selesai: 0, total: 1, persen: 0 },
          ...Array(10).fill(zero),
        ],
      },
      {
        userId: 2,
        nama: 'B',
        months: [
          { selesai: 1, total: 1, persen: 100 },
          ...Array(11).fill(zero),
        ],
      },
    ]);
  });
});
