import { LaporanService } from '../src/laporan/laporan.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ROLES } from '../src/common/roles.constants';
import { STATUS } from '../src/common/status.constants';

const prisma = {
  laporanHarian: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
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
    penugasanId: 1,
    tanggal: '2024-05-01',
    status: STATUS.BELUM,
    deskripsi: 'test',
  };

  it('throws ForbiddenException when not assignment owner', async () => {
    prisma.penugasan.findUnique.mockResolvedValue({
      id: 1,
      pegawaiId: 2,
      kegiatan: { teamId: 1 },
    });
    await expect(service.submit(data as any, 1, ROLES.ANGGOTA)).rejects.toThrow(ForbiddenException);
  });

  it('allows admin to submit for other user', async () => {
    prisma.penugasan.findUnique.mockResolvedValue({
      id: 1,
      pegawaiId: 2,
      kegiatan: { teamId: 1 },
    });
    prisma.laporanHarian.create.mockResolvedValue({ id: 10 });
    prisma.laporanHarian.findFirst.mockResolvedValue(null);
    prisma.penugasan.update.mockResolvedValue({});

    const res = await service.submit(data as any, 1, ROLES.ADMIN);

    expect(res).toEqual({ id: 10 });
    expect(prisma.laporanHarian.create).toHaveBeenCalled();
    expect(prisma.penugasan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: STATUS.BELUM },
    });
  });

  it('sets assignment status to selesai when any report finished', async () => {
    prisma.penugasan.findUnique.mockResolvedValue({
      id: 1,
      pegawaiId: 1,
      kegiatan: { teamId: 1 },
    });
    prisma.member.findMany.mockResolvedValue([]);
    prisma.laporanHarian.create.mockResolvedValue({ id: 11 });
    prisma.laporanHarian.findFirst.mockResolvedValueOnce({
      status: STATUS.SELESAI_DIKERJAKAN,
    });
    prisma.penugasan.update.mockResolvedValue({});

    await service.submit(data as any, 1, ROLES.ANGGOTA);

    expect(prisma.penugasan.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: STATUS.SELESAI_DIKERJAKAN },
    });
  });
});

describe('LaporanService update', () => {
  it('throws ForbiddenException when updating others report', async () => {
    prisma.laporanHarian.findUnique.mockResolvedValue({
      id: 1,
      pegawaiId: 2,
      penugasanId: 1,
      penugasan: { kegiatan: { teamId: 1 } },
    });
    const action = service.update(1, { tanggal: '2024-05-01', status: STATUS.BELUM } as any, 3, ROLES.ANGGOTA);
    await expect(action).rejects.toThrow(ForbiddenException);
  });
});

describe('LaporanService remove', () => {
  it('throws NotFoundException when report not found', async () => {
    prisma.laporanHarian.findUnique.mockResolvedValue(null);
    await expect(service.remove(1, 1, ROLES.ADMIN)).rejects.toThrow(NotFoundException);
  });

  it('allows leader to remove others report', async () => {
    prisma.laporanHarian.findUnique.mockResolvedValue({
      id: 1,
      pegawaiId: 2,
      penugasanId: 1,
      penugasan: { kegiatan: { teamId: 1 } },
    });
    prisma.member.findFirst.mockResolvedValue({ id: 1 });
    prisma.laporanHarian.delete.mockResolvedValue({});
    prisma.laporanHarian.findFirst.mockResolvedValue(null);
    prisma.penugasan.update.mockResolvedValue({});

    const res = await service.remove(1, 3, ROLES.KETUA);
    expect(prisma.laporanHarian.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(res).toEqual({ success: true });
  });
});
