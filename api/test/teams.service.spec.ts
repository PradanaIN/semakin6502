import { TeamsService } from '../src/teams/teams.service';
import { NotFoundException } from '@nestjs/common';

const prisma = {
  team: { findUnique: jest.fn() },
  member: { create: jest.fn() },
} as any;

const service = new TeamsService(prisma);

beforeEach(() => {
  jest.resetAllMocks();
});

describe('TeamsService findOne', () => {
  it('throws NotFoundException when team missing', async () => {
    prisma.team.findUnique.mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('returns team when found', async () => {
    prisma.team.findUnique.mockResolvedValue({ id: 1 });
    const res = await service.findOne(1);
    expect(res).toEqual({ id: 1 });
  });
});

describe('TeamsService addMember', () => {
  it('creates member with given data', async () => {
    prisma.member.create.mockResolvedValue({ id: 2 });
    const data = { user_id: 3, is_leader: true };
    const res = await service.addMember(1, data);
    expect(prisma.member.create).toHaveBeenCalledWith({
      data: { teamId: 1, userId: 3, is_leader: true },
    });
    expect(res).toEqual({ id: 2 });
  });
});
