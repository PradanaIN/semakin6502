"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const laporan_service_1 = require("../src/laporan/laporan.service");
const common_1 = require("@nestjs/common");
const roles_constants_1 = require("../src/common/roles.constants");
const status_constants_1 = require("../src/common/status.constants");
const ulid_1 = require("ulid");
const id1 = (0, ulid_1.ulid)();
const id2 = (0, ulid_1.ulid)();
const id3 = (0, ulid_1.ulid)();
const id10 = (0, ulid_1.ulid)();
const id11 = (0, ulid_1.ulid)();
const id12 = (0, ulid_1.ulid)();
const id13 = (0, ulid_1.ulid)();
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
};
const notifications = { create: jest.fn() };
const service = new laporan_service_1.LaporanService(prisma, notifications);
beforeEach(() => {
    jest.resetAllMocks();
});
describe('LaporanService getAll', () => {
    it('passes skip and take to prisma', async () => {
        prisma.laporanHarian.findMany.mockResolvedValue([]);
        await service.getAll(5, 10);
        expect(prisma.laporanHarian.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 5, take: 10 }));
    });
    it('ignores invalid pagination values', async () => {
        prisma.laporanHarian.findMany.mockResolvedValue([]);
        await service.getAll(-1, 0);
        expect(prisma.laporanHarian.findMany).toHaveBeenCalledWith(expect.not.objectContaining({ skip: expect.anything(), take: expect.anything() }));
    });
});
describe('LaporanService submit', () => {
    const data = {
        penugasanId: id1,
        tanggal: '2024-05-01',
        status: status_constants_1.STATUS.BELUM,
        deskripsi: 'test',
    };
    it('throws ForbiddenException when not assignment owner', async () => {
        prisma.penugasan.findUnique.mockResolvedValue({
            id: id1,
            pegawaiId: id2,
            kegiatan: { teamId: id1 },
        });
        await expect(service.submit(data, id1, roles_constants_1.ROLES.ANGGOTA)).rejects.toThrow(common_1.ForbiddenException);
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
        const res = await service.submit(data, id1, roles_constants_1.ROLES.ADMIN);
        expect(res).toEqual({ id: id10 });
        expect(prisma.laporanHarian.create).toHaveBeenCalled();
        expect(prisma.penugasan.update).toHaveBeenCalledWith({
            where: { id: id1 },
            data: { status: status_constants_1.STATUS.BELUM },
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
            status: status_constants_1.STATUS.SELESAI_DIKERJAKAN,
            buktiLink: "link",
        });
        prisma.penugasan.update.mockResolvedValue({});
        await service.submit(data, id1, roles_constants_1.ROLES.ANGGOTA);
        expect(prisma.penugasan.update).toHaveBeenCalledWith({
            where: { id: id1 },
            data: { status: status_constants_1.STATUS.SELESAI_DIKERJAKAN },
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
            status: status_constants_1.STATUS.BELUM,
            deskripsi: 'd',
            capaianKegiatan: 'cap',
        };
        const res = await service.submit(payload, id1, roles_constants_1.ROLES.ANGGOTA);
        expect(res).toEqual({ id: id12 });
        expect(prisma.laporanHarian.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                buktiLink: undefined,
                catatan: undefined,
            }),
        }));
    });
    it('ignores errors from syncPenugasanStatus', async () => {
        prisma.penugasan.findUnique.mockResolvedValue({
            id: id1,
            pegawaiId: id1,
            kegiatan: { teamId: id1 },
        });
        prisma.laporanHarian.create.mockResolvedValue({ id: id13 });
        const spy = jest
            .spyOn(service, 'syncPenugasanStatus')
            .mockRejectedValue(new Error('fail'));
        const res = await service.submit(data, id1, roles_constants_1.ROLES.ANGGOTA);
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
        const action = service.update(id1, { tanggal: '2024-05-01', status: status_constants_1.STATUS.BELUM }, id3, roles_constants_1.ROLES.ANGGOTA);
        await expect(action).rejects.toThrow(common_1.ForbiddenException);
    });
});
describe('LaporanService remove', () => {
    it('throws NotFoundException when report not found', async () => {
        prisma.laporanHarian.findUnique.mockResolvedValue(null);
        await expect(service.remove(id1, id1, roles_constants_1.ROLES.ADMIN)).rejects.toThrow(common_1.NotFoundException);
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
        const res = await service.remove(id1, id3, roles_constants_1.ROLES.KETUA);
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
                status: status_constants_1.STATUS.BELUM,
                deskripsi: 'laporan',
                penugasan: { kegiatan: { team: { namaTim: 'A' } } },
            },
        ]);
        prisma.kegiatanTambahan.findMany.mockResolvedValue([
            {
                id: id2,
                tanggal: new Date('2024-05-02'),
                status: status_constants_1.STATUS.BELUM,
                nama: 'tambahan',
                deskripsi: 'desc',
                buktiLink: null,
                kegiatan: { deskripsi: 'd', team: { namaTim: 'A' } },
            },
        ]);
        const res = await service.getByMonthWeek(id1, '5', undefined, true);
        expect(prisma.kegiatanTambahan.findMany).toHaveBeenCalled();
        expect(res.length).toBe(2);
        const tambahan = res.find((r) => r.id === id2);
        expect(tambahan.type).toBe('tambahan');
    });
    it('handles laporan without penugasan when including tambahan', async () => {
        prisma.laporanHarian.findMany.mockResolvedValue([
            {
                id: id1,
                tanggal: new Date('2024-05-03'),
                status: status_constants_1.STATUS.BELUM,
                deskripsi: 'no penugasan',
                penugasan: null,
            },
        ]);
        prisma.kegiatanTambahan.findMany.mockResolvedValue([]);
        const res = await service.getByMonthWeek(id1, undefined, undefined, true);
        expect(res).toHaveLength(1);
        expect(res[0].penugasan).toBeNull();
    });
});
