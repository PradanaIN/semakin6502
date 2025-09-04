"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const teams_controller_1 = require("../src/teams/teams.controller");
const teams_service_1 = require("../src/teams/teams.service");
const jwt_auth_guard_1 = require("../src/common/guards/jwt-auth.guard");
const roles_guard_1 = require("../src/common/guards/roles.guard");
const roles_constants_1 = require("../src/common/roles.constants");
describe('TeamsController (integration)', () => {
    let app;
    const service = {
        findAll: jest.fn(),
        addMember: jest.fn(),
    };
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [teams_controller_1.TeamsController],
            providers: [{ provide: teams_service_1.TeamsService, useValue: service }],
        })
            .overrideGuard(jwt_auth_guard_1.JwtAuthGuard)
            .useValue({
            canActivate: (context) => {
                const req = context.switchToHttp().getRequest();
                req.user = { userId: 'u1', role: roles_constants_1.ROLES.ADMIN };
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
    it('GET /teams returns all teams for admin', async () => {
        service.findAll.mockResolvedValue([{ id: 't1' }]);
        await (0, supertest_1.default)(app.getHttpServer())
            .get('/teams')
            .expect(200)
            .expect([{ id: 't1' }]);
    });
    it('POST /teams/:id/members adds a member', async () => {
        service.addMember.mockResolvedValue({ id: 'm1' });
        await (0, supertest_1.default)(app.getHttpServer())
            .post('/teams/1/members')
            .send({ user_id: 'u2', isLeader: false })
            .expect(201)
            .expect({ id: 'm1' });
    });
});
