import { PenugasanService } from "../src/kegiatan/penugasan.service";
import { BadRequestException } from "@nestjs/common";

const prisma = {
  penugasan: { findUnique: jest.fn(), delete: jest.fn() },
  member: { findFirst: jest.fn() },
  laporanHarian: { count: jest.fn() },
} as any;

const notifications = { create: jest.fn() } as any;

const service = new PenugasanService(prisma, notifications);

describe("PenugasanService remove", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("throws BadRequestException when laporan harian exists", async () => {
    prisma.penugasan.findUnique.mockResolvedValue({
      id: 1,
      kegiatan: { teamId: 2 },
    });
    prisma.member.findFirst.mockResolvedValue({ id: 1 });
    prisma.laporanHarian.count.mockResolvedValue(1);

    const action = service.remove(1, 1, "admin");
    await expect(action).rejects.toThrow(BadRequestException);
    await expect(action).rejects.toThrow(
      "Hapus laporan harian penugasan ini terlebih dahulu"
    );
    expect(prisma.penugasan.delete).not.toHaveBeenCalled();
  });
});
