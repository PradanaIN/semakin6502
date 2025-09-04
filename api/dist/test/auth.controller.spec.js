"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_controller_1 = require("../src/auth/auth.controller");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const service = {
    login: jest.fn(),
    me: jest.fn(),
};
const controller = new auth_controller_1.AuthController(service, new config_1.ConfigService());
describe('AuthController login', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    it('sets cookie and returns user', async () => {
        const res = { cookie: jest.fn() };
        service.login.mockResolvedValue({ access_token: 'tok', user: { id: '1' } });
        const result = await controller.login({ identifier: 'a', password: 'b' }, res);
        expect(result).toEqual({ user: { id: '1' } });
        expect(res.cookie).toHaveBeenCalledWith('token', 'tok', expect.any(Object));
    });
    it('propagates errors from service', async () => {
        const res = { cookie: jest.fn() };
        service.login.mockRejectedValue(new common_1.UnauthorizedException());
        await expect(controller.login({ identifier: 'a', password: 'b' }, res)).rejects.toThrow(common_1.UnauthorizedException);
    });
});
describe('AuthController logout', () => {
    it('clears cookie and returns message', () => {
        const res = { clearCookie: jest.fn() };
        const result = controller.logout(res);
        expect(res.clearCookie).toHaveBeenCalledWith('token');
        expect(result).toEqual({ message: 'Logged out' });
    });
});
describe('AuthController me', () => {
    it('returns current user', async () => {
        const req = { user: { userId: '1' } };
        service.me.mockResolvedValue({ id: '1' });
        const result = await controller.me(req);
        expect(service.me).toHaveBeenCalledWith('1');
        expect(result).toEqual({ user: { id: '1' } });
    });
});
