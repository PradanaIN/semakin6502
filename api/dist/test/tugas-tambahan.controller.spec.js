"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const tugas_tambahan_controller_1 = require("../src/laporan/tugas-tambahan.controller");
const tugas_tambahan_service_1 = require("../src/laporan/tugas-tambahan.service");
const prisma_service_1 = require("../src/prisma.service");
const jwt_auth_guard_1 = require("../src/common/guards/jwt-auth.guard");
const roles_guard_1 = require("../src/common/guards/roles.guard");
const roles_constants_1 = require("../src/common/roles.constants");
describe('TambahanController (ketua access)', () => {
    let app;
    const service = { getAll: jest.fn() };
    const prisma = { member: { findFirst: jest.fn() } };
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [tugas_tambahan_controller_1.TambahanController],
            providers: [
                { provide: tugas_tambahan_service_1.TambahanService, useValue: service },
                { provide: prisma_service_1.PrismaService, useValue: prisma },
            ],
        })
            .overrideGuard(jwt_auth_guard_1.JwtAuthGuard)
            .useValue({
            canActivate: (context) => {
                const req = context.switchToHttp().getRequest();
                req.user = { userId: 'u1', role: roles_constants_1.ROLES.KETUA };
                return true;
            },
        })
            .overrideGuard(roles_guard_1.RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();
        app = moduleRef.createNestApplication();
        await app.init();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    afterAll(async () => {
        await app.close();
    });
    it('ketua can access /tugas-tambahan/all for own team', async () => {
        prisma.member.findFirst.mockResolvedValue({ id: 'm1' });
        service.getAll.mockResolvedValue([{ id: 't1' }]);
        await (0, supertest_1.default)(app.getHttpServer())
            .get('/tugas-tambahan/all?teamId=team1')
            .expect(200)
            .expect([{ id: 't1' }]);
        expect(service.getAll).toHaveBeenCalledWith({ teamId: 'team1' });
    });
    it("ketua receives 403 for other team's data", async () => {
        prisma.member.findFirst.mockResolvedValue(null);
        await (0, supertest_1.default)(app.getHttpServer())
            .get('/tugas-tambahan/all?teamId=team2')
            .expect(403);
        expect(service.getAll).not.toHaveBeenCalled();
    });
});
