import { AuthService } from '../src/auth/auth.service';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const prisma = {
  user: { findFirst: jest.fn(), findUnique: jest.fn() },
} as any;

const jwtService = { sign: jest.fn(() => 'signed') } as any;

const service = new AuthService(jwtService, prisma);

describe('AuthService login', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('throws UnauthorizedException when user not found', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.login('a', 'b')).rejects.toThrow(UnauthorizedException);
  });
});

test('returns token and user on success', async () => {
    prisma.user.findFirst.mockResolvedValue({
    id: '1',
    email: 'a',
    username: 'a',
    password: bcrypt.hashSync('b', 1),
    role: 'admin',
  });
  const result = await service.login('a', 'b');
  expect(result).toHaveProperty('access_token');
  expect(result.user).toHaveProperty('id', '1');
  expect(prisma.user.findFirst).toHaveBeenCalled();
  expect(jwtService.sign).toHaveBeenCalled();
});

describe('AuthService me', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('throws NotFoundException when user missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.me('1')).rejects.toThrow(NotFoundException);
  });

  it('returns sanitized user', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      nama: 'A',
      username: 'a',
      email: 'a@b.c',
      password: 'x',
      role: 'admin',
      members: [{ teamId: '2', team: { namaTim: 'Tim' } }],
    });
    const res = await service.me('1');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: { members: { include: { team: true } } },
    });
    expect(res).toEqual({
      id: '1',
      nama: 'A',
      username: 'a',
      email: 'a@b.c',
      role: 'admin',
      members: [{ teamId: '2', team: { namaTim: 'Tim' } }],
      teamId: '2',
      teamName: 'Tim',
    });
    expect(res).not.toHaveProperty('password');
  });
});
