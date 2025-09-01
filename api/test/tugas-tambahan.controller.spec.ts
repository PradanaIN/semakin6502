import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TambahanController } from '../src/laporan/tugas-tambahan.controller';
import { TambahanService } from '../src/laporan/tugas-tambahan.service';
import { PrismaService } from '../src/prisma.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { ROLES } from '../src/common/roles.constants';

describe('TambahanController (ketua access)', () => {
  let app: INestApplication;
  const service = { getAll: jest.fn() } as any;
  const prisma = { member: { findFirst: jest.fn() } } as any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TambahanController],
      providers: [
        { provide: TambahanService, useValue: service },
        { provide: PrismaService, useValue: prisma },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { userId: 'u1', role: ROLES.KETUA };
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

  it('ketua can access /tugas-tambahan/all for own team', async () => {
    prisma.member.findFirst.mockResolvedValue({ id: 'm1' });
    service.getAll.mockResolvedValue([{ id: 't1' }]);

    await request(app.getHttpServer())
      .get('/tugas-tambahan/all?teamId=team1')
      .expect(200)
      .expect([{ id: 't1' }]);

    expect(service.getAll).toHaveBeenCalledWith({ teamId: 'team1' });
  });

  it("ketua receives 403 for other team's data", async () => {
    prisma.member.findFirst.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/tugas-tambahan/all?teamId=team2')
      .expect(403);

    expect(service.getAll).not.toHaveBeenCalled();
  });
});
