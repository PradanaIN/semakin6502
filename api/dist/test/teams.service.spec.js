"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const teams_service_1 = require("../src/teams/teams.service");
const common_1 = require("@nestjs/common");
const prisma = {
    team: { findUnique: jest.fn() },
    member: { create: jest.fn() },
};
const service = new teams_service_1.TeamsService(prisma);
beforeEach(() => {
    jest.resetAllMocks();
});
describe('TeamsService findOne', () => {
    it('throws NotFoundException when team missing', async () => {
        prisma.team.findUnique.mockResolvedValue(null);
        await expect(service.findOne('1')).rejects.toThrow(common_1.NotFoundException);
    });
    it('returns team when found', async () => {
        prisma.team.findUnique.mockResolvedValue({ id: '1' });
        const res = await service.findOne('1');
        expect(res).toEqual({ id: '1' });
    });
});
describe('TeamsService addMember', () => {
    it('creates member with given data', async () => {
        prisma.member.create.mockResolvedValue({ id: '2' });
        const data = { user_id: '3', isLeader: true };
        const res = await service.addMember('1', data);
        expect(prisma.member.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ teamId: '1', userId: '3', isLeader: true }),
        }));
        expect(res).toEqual({ id: '2' });
    });
});
