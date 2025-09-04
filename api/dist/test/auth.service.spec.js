"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../src/auth/auth.service");
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma = {
    user: { findFirst: jest.fn(), findUnique: jest.fn() },
};
const jwtService = { sign: jest.fn(() => 'signed') };
const service = new auth_service_1.AuthService(jwtService, prisma);
describe('AuthService login', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    it('throws UnauthorizedException when user not found', async () => {
        prisma.user.findFirst.mockResolvedValue(null);
        await expect(service.login('a', 'b')).rejects.toThrow(common_1.UnauthorizedException);
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
        await expect(service.me('1')).rejects.toThrow(common_1.NotFoundException);
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
