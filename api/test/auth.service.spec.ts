import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const prisma = {
  user: { findFirst: jest.fn() },
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
    id: 1,
    email: 'a',
    username: 'a',
    password: bcrypt.hashSync('b', 1),
    role: 'admin',
  });
  const result = await service.login('a', 'b');
  expect(result).toHaveProperty('access_token');
  expect(result.user).toHaveProperty('id', 1);
  expect(prisma.user.findFirst).toHaveBeenCalled();
  expect(jwtService.sign).toHaveBeenCalled();
});
