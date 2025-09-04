"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const master_kegiatan_service_1 = require("../src/kegiatan/master-kegiatan.service");
const roles_constants_1 = require("../src/common/roles.constants");
describe('MasterKegiatanService findAll', () => {
    const prisma = {
        masterKegiatan: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
        member: {
            findMany: jest.fn(),
        },
        $transaction: jest.fn(),
    };
    const service = new master_kegiatan_service_1.MasterKegiatanService(prisma);
    beforeEach(() => {
        jest.resetAllMocks();
        prisma.$transaction.mockImplementation(async (actions) => {
            const results = [];
            for (const action of actions) {
                results.push(await action);
            }
            return results;
        });
    });
    it('returns items containing teamId for admin', async () => {
        prisma.masterKegiatan.findMany.mockResolvedValue([
            { id: '1', teamId: '2', namaKegiatan: 'Test' },
        ]);
        prisma.masterKegiatan.count.mockResolvedValue(1);
        const result = await service.findAll({ page: 1, limit: 10, teamId: '2' }, 'admin', roles_constants_1.ROLES.ADMIN);
        expect(prisma.masterKegiatan.findMany).toHaveBeenCalledWith({
            where: { teamId: '2' },
            include: { team: true },
            skip: 0,
            take: 10,
        });
        expect(result.data[0]).toHaveProperty('teamId', '2');
        expect(prisma.member.findMany).not.toHaveBeenCalled();
    });
    it('ketua gets only own team activities', async () => {
        prisma.member.findMany.mockResolvedValue([{ teamId: '2' }]);
        prisma.masterKegiatan.findMany.mockResolvedValue([
            { id: '1', teamId: '2', namaKegiatan: 'Test' },
        ]);
        prisma.masterKegiatan.count.mockResolvedValue(1);
        const result = await service.findAll({ page: 1, limit: 10 }, 'user1', roles_constants_1.ROLES.KETUA);
        expect(prisma.masterKegiatan.findMany).toHaveBeenCalledWith({
            where: { teamId: { in: ['2'] } },
            include: { team: true },
            skip: 0,
            take: 10,
        });
        expect(result.data[0]).toHaveProperty('teamId', '2');
    });
    it('ketua requesting other team throws ForbiddenException', async () => {
        prisma.member.findMany.mockResolvedValue([{ teamId: '2' }]);
        await expect(service.findAll({ teamId: '3' }, 'user1', roles_constants_1.ROLES.KETUA)).rejects.toBeInstanceOf(common_1.ForbiddenException);
        expect(prisma.masterKegiatan.findMany).not.toHaveBeenCalled();
    });
    it('anggota gets only own team activities', async () => {
        prisma.member.findMany.mockResolvedValue([{ teamId: '2' }]);
        prisma.masterKegiatan.findMany.mockResolvedValue([
            { id: '1', teamId: '2', namaKegiatan: 'Test' },
        ]);
        prisma.masterKegiatan.count.mockResolvedValue(1);
        const result = await service.findAll({ page: 1, limit: 10 }, 'user1', roles_constants_1.ROLES.ANGGOTA);
        expect(prisma.masterKegiatan.findMany).toHaveBeenCalledWith({
            where: { teamId: { in: ['2'] } },
            include: { team: true },
            skip: 0,
            take: 10,
        });
        expect(result.data[0]).toHaveProperty('teamId', '2');
    });
    it('anggota requesting other team throws ForbiddenException', async () => {
        prisma.member.findMany.mockResolvedValue([{ teamId: '2' }]);
        await expect(service.findAll({ teamId: '3' }, 'user1', roles_constants_1.ROLES.ANGGOTA)).rejects.toBeInstanceOf(common_1.ForbiddenException);
        expect(prisma.masterKegiatan.findMany).not.toHaveBeenCalled();
    });
});
