import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TeamsController } from '../src/teams/teams.controller';
import { TeamsService } from '../src/teams/teams.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { ROLES } from '../src/common/roles.constants';

describe('TeamsController (integration)', () => {
  let app: INestApplication;
  const service = {
    findAll: jest.fn(),
    addMember: jest.fn(),
  } as any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [{ provide: TeamsService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { userId: 'u1', role: ROLES.ADMIN };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
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
    await request(app.getHttpServer())
      .get('/teams')
      .expect(200)
      .expect([{ id: 't1' }]);
  });

  it('POST /teams/:id/members adds a member', async () => {
    service.addMember.mockResolvedValue({ id: 'm1' });
    await request(app.getHttpServer())
      .post('/teams/1/members')
      .send({ user_id: 'u2', isLeader: false })
      .expect(201)
      .expect({ id: 'm1' });
  });
});
