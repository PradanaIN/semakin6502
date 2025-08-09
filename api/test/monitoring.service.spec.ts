import { MonitoringService } from '../src/monitoring/monitoring.service';
import { STATUS } from '../src/common/status.constants';
import { ROLES } from '../src/common/roles.constants';

describe('MonitoringService aggregated', () => {
  const prisma = {
    laporanHarian: { findMany: jest.fn() },
    penugasan: { findMany: jest.fn() },
    user: { findMany: jest.fn() },
  } as any;
  const service = new MonitoringService(prisma);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('harianAll aggregates and sorts by name', async () => {
    prisma.laporanHarian.findMany.mockResolvedValue([
      { pegawaiId: '2', status: STATUS.SELESAI_DIKERJAKAN, pegawai: { nama: 'B' } },
      { pegawaiId: '1', status: STATUS.BELUM, pegawai: { nama: 'A' } },
      { pegawaiId: '1', status: STATUS.SELESAI_DIKERJAKAN, pegawai: { nama: 'A' } },
    ]);
    const res = await service.harianAll('2024-05-01');
    expect(res).toEqual([
      { userId: '1', nama: 'A', selesai: 1, total: 2, persen: 50 },
      { userId: '2', nama: 'B', selesai: 1, total: 1, persen: 100 },
    ]);
  });

  it('harianAll returns zero metrics for all users when no reports', async () => {
    prisma.laporanHarian.findMany.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([
      { id: '1', nama: 'A' },
      { id: '2', nama: 'B' },
    ]);
    const res = await service.harianAll('2024-05-01');
    expect(res).toEqual([
      { userId: '1', nama: 'A', selesai: 0, total: 0, persen: 0 },
      { userId: '2', nama: 'B', selesai: 0, total: 0, persen: 0 },
    ]);
  });

  it('mingguanAll aggregates and sorts', async () => {
    prisma.laporanHarian.findMany.mockResolvedValue([
      { pegawaiId: '2', status: STATUS.SELESAI_DIKERJAKAN, pegawai: { nama: 'B' } },
      { pegawaiId: '1', status: STATUS.BELUM, pegawai: { nama: 'A' } },
      { pegawaiId: '1', status: STATUS.SELESAI_DIKERJAKAN, pegawai: { nama: 'A' } },
    ]);
    const res = await service.mingguanAll('2024-05-01');
    expect(res).toEqual([
      { userId: '1', nama: 'A', selesai: 1, total: 2, persen: 50 },
      { userId: '2', nama: 'B', selesai: 1, total: 1, persen: 100 },
    ]);
  });

  it('mingguanAll returns zero metrics for all users when no reports', async () => {
    prisma.laporanHarian.findMany.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([
      { id: '1', nama: 'A' },
      { id: '2', nama: 'B' },
    ]);
    const res = await service.mingguanAll('2024-05-01');
    expect(res).toEqual([
      { userId: '1', nama: 'A', selesai: 0, total: 0, persen: 0 },
      { userId: '2', nama: 'B', selesai: 0, total: 0, persen: 0 },
    ]);
  });

  it('mingguan calculates progress from assignments and marks presence', async () => {
    prisma.penugasan.findMany.mockResolvedValue([
      { status: STATUS.SELESAI_DIKERJAKAN },
      { status: STATUS.BELUM },
    ]);
    prisma.laporanHarian.findMany.mockResolvedValue([
      { tanggal: new Date('2024-04-29'), status: STATUS.SELESAI_DIKERJAKAN },
      { tanggal: new Date('2024-05-01'), status: STATUS.BELUM },
    ]);

    const res = await service.mingguan('2024-05-01');

    expect(prisma.penugasan.findMany).toHaveBeenCalledWith({
      where: { minggu: 1, bulan: '5', tahun: 2024 },
      select: { status: true },
    });

    expect(res.totalTugas).toBe(2);
    expect(res.totalSelesai).toBe(1);
    expect(res.detail[0].persen).toBe(100);
    expect(res.detail[1].persen).toBe(0);
    expect(res.detail[2].persen).toBe(100);
  });

  it('bulananAll aggregates and passes bulan filter', async () => {
    prisma.penugasan.findMany.mockResolvedValue([
      { pegawaiId: '2', bulan: '1', status: STATUS.SELESAI_DIKERJAKAN, pegawai: { nama: 'B' } },
      { pegawaiId: '1', bulan: '1', status: STATUS.BELUM, pegawai: { nama: 'A' } },
      { pegawaiId: '1', bulan: '1', status: STATUS.SELESAI_DIKERJAKAN, pegawai: { nama: 'A' } },
    ]);
    const res = await service.bulananAll('2024', '3', '1');
    expect(prisma.penugasan.findMany).toHaveBeenCalledWith({
      where: { tahun: 2024, bulan: '1', kegiatan: { teamId: '3' } },
      include: { pegawai: true },
    });
    expect(res).toEqual([
      { userId: '1', nama: 'A', selesai: 1, total: 2, persen: 50 },
      { userId: '2', nama: 'B', selesai: 1, total: 1, persen: 100 },
    ]);
  });

  it('harianBulan groups by user and counts records', async () => {
    prisma.laporanHarian.findMany.mockResolvedValue([
      { pegawaiId: '1', tanggal: new Date('2024-05-02'), pegawai: { nama: 'A' } },
      { pegawaiId: '1', tanggal: new Date('2024-05-02'), pegawai: { nama: 'A' } },
      { pegawaiId: '2', tanggal: new Date('2024-05-01'), pegawai: { nama: 'B' } },
    ]);
    const res = await service.harianBulan('2024-05-10');
    expect(res.map((u) => u.nama)).toEqual(['A', 'B']);
    expect(res[0].detail.length).toBe(31);
    expect(res[0].detail[1]).toEqual({ tanggal: '2024-05-02T00:00:00.000Z', count: 2 });
    expect(res[1].detail[0]).toEqual({ tanggal: '2024-05-01T00:00:00.000Z', count: 1 });
  });

  it('harianBulan returns zero counts for all users when no reports', async () => {
    prisma.laporanHarian.findMany.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([
      { id: '1', nama: 'A' },
      { id: '2', nama: 'B' },
    ]);
    const res = await service.harianBulan('2024-05-10');
    const zeroDetail = Array.from({ length: 31 }, (_, i) => ({
      tanggal: new Date(Date.UTC(2024, 4, i + 1)).toISOString(),
      count: 0,
    }));
    expect(res).toEqual([
      { userId: '1', nama: 'A', detail: zeroDetail },
      { userId: '2', nama: 'B', detail: zeroDetail },
    ]);
  });

  it('mingguanBulan aggregates per week', async () => {
    prisma.laporanHarian.findMany.mockResolvedValue([
      {
        pegawaiId: '1',
        tanggal: new Date('2024-05-02'),
        status: STATUS.SELESAI_DIKERJAKAN,
        pegawai: { nama: 'A' },
      },
      {
        pegawaiId: '1',
        tanggal: new Date('2024-05-08'),
        status: STATUS.BELUM,
        pegawai: { nama: 'A' },
      },
      {
        pegawaiId: '2',
        tanggal: new Date('2024-05-15'),
        status: STATUS.SELESAI_DIKERJAKAN,
        pegawai: { nama: 'B' },
      },
    ]);
    const res = await service.mingguanBulan('2024-05-10');
    expect(res).toEqual([
      {
        userId: '1',
        nama: 'A',
        weeks: [
          { selesai: 1, total: 1, persen: 100 },
          { selesai: 0, total: 1, persen: 100 },
          { selesai: 0, total: 0, persen: 0 },
          { selesai: 0, total: 0, persen: 0 },
          { selesai: 0, total: 0, persen: 0 },
        ],
      },
      {
        userId: '2',
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

  it('mingguanBulan returns zero weeks for all users when no reports', async () => {
    prisma.laporanHarian.findMany.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([
      { id: '1', nama: 'A' },
      { id: '2', nama: 'B' },
    ]);
    const res = await service.mingguanBulan('2024-05-10');
    const zeroWeeks = () =>
      Array.from({ length: 5 }, () => ({ selesai: 0, total: 0, persen: 0 }));
    expect(res).toEqual([
      { userId: '1', nama: 'A', weeks: zeroWeeks() },
      { userId: '2', nama: 'B', weeks: zeroWeeks() },
    ]);
  });

  it('penugasanBulan aggregates per week', async () => {
    prisma.penugasan.findMany.mockResolvedValue([
      { minggu: 1, status: STATUS.SELESAI_DIKERJAKAN },
      { minggu: 1, status: STATUS.BELUM },
      { minggu: 3, status: STATUS.SELESAI_DIKERJAKAN },
    ]);

    const res = await service.penugasanBulan('2024-05-10');
    expect(prisma.penugasan.findMany).toHaveBeenCalledWith({
      where: { tahun: 2024, bulan: '5' },
      select: { minggu: true, status: true },
    });
    const zero = { selesai: 0, total: 0, persen: 0 };
    expect(res).toEqual([
      { minggu: 1, selesai: 1, total: 2, persen: 50 },
      { minggu: 2, ...zero },
      { minggu: 3, selesai: 1, total: 1, persen: 100 },
      { minggu: 4, ...zero },
      { minggu: 5, ...zero },
    ]);
  });

  it('bulanan averages weekly progress', async () => {
    const weeks = [
      { minggu: 1, selesai: 1, total: 1, persen: 100 },
      { minggu: 2, selesai: 0, total: 1, persen: 0 },
      { minggu: 3, selesai: 1, total: 1, persen: 100 },
    ];
    const spy = jest
      .spyOn(service, 'penugasanBulan')
      .mockResolvedValue(weeks);

    const res = await service.bulanan('2024');
    expect(spy).toHaveBeenCalledTimes(12);
    expect(res[0]).toEqual({ bulan: 'Januari', persen: 67 });

    const resUser = await service.bulanan('2024', undefined, '1');
    expect(resUser[0]).toEqual({ bulan: 'Januari', persen: 67 });
  });

  it('bulananMatrix aggregates per month', async () => {
    prisma.penugasan.findMany.mockResolvedValue([
      {
        pegawaiId: '1',
        bulan: '1',
        status: STATUS.SELESAI_DIKERJAKAN,
        pegawai: { nama: 'A' },
      },
      {
        pegawaiId: '1',
        bulan: '2',
        status: STATUS.BELUM,
        pegawai: { nama: 'A' },
      },
      {
        pegawaiId: '2',
        bulan: '1',
        status: STATUS.SELESAI_DIKERJAKAN,
        pegawai: { nama: 'B' },
      },
    ]);

    const res = await service.bulananMatrix('2024');
    const zero = { selesai: 0, total: 0, persen: 0 };
    expect(res).toEqual([
      {
        userId: '1',
        nama: 'A',
        months: [
          { selesai: 1, total: 1, persen: 100 },
          { selesai: 0, total: 1, persen: 0 },
          ...Array(10).fill(zero),
        ],
      },
      {
        userId: '2',
        nama: 'B',
        months: [
          { selesai: 1, total: 1, persen: 100 },
          ...Array(11).fill(zero),
        ],
      },
    ]);
  });

  it('laporanTerlambat categorizes users by last report date and excludes admin/pimpinan', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-05-10'));
    prisma.user.findMany.mockResolvedValue([
      {
        id: '1',
        nama: 'A',
        role: ROLES.ANGGOTA,
        laporan: [{ tanggal: new Date('2024-05-02') }],
      },
      {
        id: '2',
        nama: 'B',
        role: ROLES.KETUA,
        laporan: [{ tanggal: new Date('2024-05-05') }],
      },
    ]);

    const res = await service.laporanTerlambat();

    expect(res.day7).toEqual([
      { userId: '1', nama: 'A', lastDate: '2024-05-02T00:00:00.000Z' },
    ]);
    expect(res.day3).toEqual([
      { userId: '2', nama: 'B', lastDate: '2024-05-05T00:00:00.000Z' },
    ]);
    expect(res.day1).toEqual([]);
    jest.useRealTimers();
  });

  it('laporanTerlambat merges role filter with team filter', async () => {
    prisma.user.findMany.mockResolvedValue([]);
    await service.laporanTerlambat('1');
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        NOT: { role: { in: [ROLES.ADMIN, ROLES.PIMPINAN] } },
        members: { some: { teamId: '1' } },
      },
      include: { laporan: { orderBy: { tanggal: 'desc' }, take: 1 } },
      orderBy: { nama: 'asc' },
    });
  });
});
