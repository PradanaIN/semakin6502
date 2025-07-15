import { MasterKegiatanService } from '../src/kegiatan/master-kegiatan.service';

describe('MasterKegiatanService findAll', () => {
  const prisma = {
    masterKegiatan: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;
  const service = new MasterKegiatanService(prisma);

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation(async (actions: any[]) => {
      const results = [];
      for (const action of actions) {
        results.push(await action);
      }
      return results;
    });
  });

  it('returns items containing teamId', async () => {
    prisma.masterKegiatan.findMany.mockResolvedValue([
      { id: 1, teamId: 2, nama_kegiatan: 'Test' },
    ]);
    prisma.masterKegiatan.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10, teamId: 2 });

    expect(prisma.masterKegiatan.findMany).toHaveBeenCalledWith({
      where: { teamId: 2 },
      include: { team: true },
      skip: 0,
      take: 10,
    });
    expect(result.data[0]).toHaveProperty('teamId', 2);
  });
});
