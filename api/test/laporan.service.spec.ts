import { LaporanService } from '../src/laporan/laporan.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ROLES } from '../src/common/roles.constants';
import { STATUS } from '../src/common/status.constants';
import { ulid } from 'ulid';

const id1 = ulid();
const id2 = ulid();
const id3 = ulid();
const id10 = ulid();
const id11 = ulid();
const id12 = ulid();
const id13 = ulid();

const prisma = {
  laporanHarian: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  kegiatanTambahan: { findMany: jest.fn() },
  penugasan: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  member: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
} as any;

const notifications = { create: jest.fn() } as any;

const service = new LaporanService(prisma, notifications);

beforeEach(() => {
  jest.resetAllMocks();
});

describe('LaporanService submit', () => {
  const data = {
    penugasanId: id1,
    tanggal: '2024-05-01',
    status: STATUS.BELUM,
    deskripsi: 'test',
  };

  it('throws ForbiddenException when not assignment owner', async () => {
    prisma.penugasan.findUnique.mockResolvedValue({
      id: id1,
      pegawaiId: id2,
      kegiatan: { teamId: id1 },
    });
    await expect(service.submit(data as any, id1, ROLES.ANGGOTA)).rejects.toThrow(ForbiddenException);
  });

  it('allows admin to submit for other user', async () => {
    prisma.penugasan.findUnique.mockResolvedValue({
      id: id1,
      pegawaiId: id2,
      kegiatan: { teamId: id1 },
    });
    prisma.laporanHarian.create.mockResolvedValue({ id: id10 });
    prisma.laporanHarian.findFirst.mockResolvedValue(null);
    prisma.penugasan.update.mockResolvedValue({});

    const res = await service.submit(data as any, id1, ROLES.ADMIN);

    expect(res).toEqual({ id: id10 });
    expect(prisma.laporanHarian.create).toHaveBeenCalled();
    expect(prisma.penugasan.update).toHaveBeenCalledWith({
      where: { id: id1 },
      data: { status: STATUS.BELUM },
    });
  });

  it('sets assignment status to selesai when any report finished', async () => {
    prisma.penugasan.findUnique.mockResolvedValue({
      id: id1,
      pegawaiId: id1,
      kegiatan: { teamId: id1 },
    });
    prisma.member.findMany.mockResolvedValue([]);
    prisma.laporanHarian.create.mockResolvedValue({ id: id11 });
    prisma.laporanHarian.findFirst.mockResolvedValueOnce({
      status: STATUS.SELESAI_DIKERJAKAN,
    });
    prisma.penugasan.update.mockResolvedValue({});

    await service.submit(data as any, id1, ROLES.ANGGOTA);

    expect(prisma.penugasan.update).toHaveBeenCalledWith({
      where: { id: id1 },
      data: { status: STATUS.SELESAI_DIKERJAKAN },
    });
  });

  it('returns laporan when optional fields missing', async () => {
    prisma.penugasan.findUnique.mockResolvedValue({
      id: id1,
      pegawaiId: id1,
      kegiatan: { teamId: id1 },
    });
    prisma.laporanHarian.create.mockResolvedValue({ id: id12 });
    prisma.laporanHarian.findFirst.mockResolvedValue(null);
    prisma.penugasan.update.mockResolvedValue({});

    const payload = {
      penugasanId: id1,
      tanggal: '2024-05-02',
      status: STATUS.BELUM,
      deskripsi: 'd',
      capaianKegiatan: 'cap',
    } as any;

    const res = await service.submit(payload, id1, ROLES.ANGGOTA);

    expect(res).toEqual({ id: id12 });
    expect(prisma.laporanHarian.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          buktiLink: undefined,
          catatan: undefined,
        }),
      }),
    );
  });

  it('ignores errors from syncPenugasanStatus', async () => {
    prisma.penugasan.findUnique.mockResolvedValue({
      id: id1,
      pegawaiId: id1,
      kegiatan: { teamId: id1 },
    });
    prisma.laporanHarian.create.mockResolvedValue({ id: id13 });
    const spy = jest
      .spyOn<any, any>(service as any, 'syncPenugasanStatus')
      .mockRejectedValue(new Error('fail'));

    const res = await service.submit(data as any, id1, ROLES.ANGGOTA);

    expect(res).toEqual({ id: id13 });
    expect(spy).toHaveBeenCalled();
  });
});

describe('LaporanService update', () => {
  it('throws ForbiddenException when updating others report', async () => {
    prisma.laporanHarian.findUnique.mockResolvedValue({
      id: id1,
      pegawaiId: id2,
      penugasanId: id1,
      penugasan: { kegiatan: { teamId: id1 } },
    });
    const action = service.update(id1, { tanggal: '2024-05-01', status: STATUS.BELUM } as any, id3, ROLES.ANGGOTA);
    await expect(action).rejects.toThrow(ForbiddenException);
  });
});

describe('LaporanService remove', () => {
  it('throws NotFoundException when report not found', async () => {
    prisma.laporanHarian.findUnique.mockResolvedValue(null);
    await expect(service.remove(id1, id1, ROLES.ADMIN)).rejects.toThrow(NotFoundException);
  });

  it('allows leader to remove others report', async () => {
    prisma.laporanHarian.findUnique.mockResolvedValue({
      id: id1,
      pegawaiId: id2,
      penugasanId: id1,
      penugasan: { kegiatan: { teamId: id1 } },
    });
    prisma.member.findFirst.mockResolvedValue({ id: id1 });
    prisma.laporanHarian.delete.mockResolvedValue({});
    prisma.laporanHarian.findFirst.mockResolvedValue(null);
    prisma.penugasan.update.mockResolvedValue({});

    const res = await service.remove(id1, id3, ROLES.KETUA);
    expect(prisma.laporanHarian.delete).toHaveBeenCalledWith({ where: { id: id1 } });
    expect(res).toEqual({ success: true });
  });
});

describe('LaporanService getByMonthWeek', () => {
  it('merges additional tasks when requested', async () => {
    prisma.laporanHarian.findMany.mockResolvedValue([
      {
        id: id1,
        tanggal: new Date('2024-05-01'),
        status: STATUS.BELUM,
        deskripsi: 'laporan',
        penugasan: { kegiatan: { team: { namaTim: 'A' } } },
      },
    ]);
    prisma.kegiatanTambahan.findMany.mockResolvedValue([
      {
        id: id2,
        tanggal: new Date('2024-05-02'),
        status: STATUS.BELUM,
        nama: 'tambahan',
        deskripsi: 'desc',
        buktiLink: null,
        kegiatan: { deskripsi: 'd', team: { namaTim: 'A' } },
      },
    ]);

    const res = await service.getByMonthWeek(id1, '5', undefined, true);

    expect(prisma.kegiatanTambahan.findMany).toHaveBeenCalled();
    expect(res.length).toBe(2);
    const tambahan = res.find((r: any) => r.id === id2);
    expect(tambahan.type).toBe('tambahan');
  });
});
