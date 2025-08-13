import { AuthController } from '../src/auth/auth.controller';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const service = {
  login: jest.fn(),
  me: jest.fn(),
} as any;

const controller = new AuthController(service, new ConfigService());

describe('AuthController login', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('sets cookie and returns user', async () => {
    const res: any = { cookie: jest.fn() };
    service.login.mockResolvedValue({ access_token: 'tok', user: { id: '1' } });
    const result = await controller.login({ identifier: 'a', password: 'b' } as any, res);
    expect(result).toEqual({ user: { id: '1' } });
    expect(res.cookie).toHaveBeenCalledWith('token', 'tok', expect.any(Object));
  });

  it('propagates errors from service', async () => {
    const res: any = { cookie: jest.fn() };
    service.login.mockRejectedValue(new UnauthorizedException());
    await expect(controller.login({ identifier: 'a', password: 'b' } as any, res)).rejects.toThrow(UnauthorizedException);
  });
});

describe('AuthController logout', () => {
  it('clears cookie and returns message', () => {
    const res: any = { clearCookie: jest.fn() };
    const result = controller.logout(res);
    expect(res.clearCookie).toHaveBeenCalledWith('token');
    expect(result).toEqual({ message: 'Logged out' });
  });
});

describe('AuthController me', () => {
  it('returns current user', async () => {
    const req: any = { user: { userId: '1' } };
    service.me.mockResolvedValue({ id: '1' });
    const result = await controller.me(req);
    expect(service.me).toHaveBeenCalledWith('1');
    expect(result).toEqual({ user: { id: '1' } });
  });
});
