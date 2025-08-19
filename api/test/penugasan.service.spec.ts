import { PenugasanService } from "../src/kegiatan/penugasan.service";
import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const prisma = {
  penugasan: { findUnique: jest.fn(), delete: jest.fn(), create: jest.fn() },
  member: { findFirst: jest.fn() },
  laporanHarian: { count: jest.fn() },
  masterKegiatan: { findUnique: jest.fn() },
  user: { findUnique: jest.fn() },
} as any;

const notifications = { create: jest.fn() } as any;
const whatsappService = { sendMessage: jest.fn() } as any;
const config = {
  get: jest.fn((key: string) =>
    key === "PHONE_VALIDATION_ENABLED" ? false : ""
  ),
} as unknown as ConfigService;

const service = new PenugasanService(
  prisma,
  notifications,
  whatsappService,
  config
);

describe("PenugasanService remove", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (config.get as jest.Mock).mockImplementation((key: string) =>
      key === "PHONE_VALIDATION_ENABLED" ? false : ""
    );
  });

  it("throws BadRequestException when laporan harian exists", async () => {
    prisma.penugasan.findUnique.mockResolvedValue({
      id: '1',
      kegiatan: { teamId: '2' },
    });
    prisma.member.findFirst.mockResolvedValue({ id: '1' });
    prisma.laporanHarian.count.mockResolvedValue(1);

    const action = service.remove('1', '1', "admin");
    await expect(action).rejects.toThrow(BadRequestException);
    await expect(action).rejects.toThrow(
      "Hapus laporan harian penugasan ini terlebih dahulu"
    );
    expect(prisma.penugasan.delete).not.toHaveBeenCalled();
  });
});

describe("PenugasanService invalidateCache", () => {
  it("falls back to store.reset when cache.reset is missing", async () => {
    const store = { reset: jest.fn().mockResolvedValue(undefined) };
    const cache = { store, del: jest.fn() } as any;
    const svc = new PenugasanService(
      prisma,
      notifications,
      whatsappService,
      config,
      cache
    );

    await expect((svc as any).invalidateCache()).resolves.toBeUndefined();
    expect(store.reset).toHaveBeenCalledTimes(1);
  });
});

describe("PenugasanService assign", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (config.get as jest.Mock).mockImplementation((key: string) =>
      key === "PHONE_VALIDATION_ENABLED" ? false : ""
    );
  });

  it("sends WhatsApp message when pegawai has phone", async () => {
    prisma.masterKegiatan.findUnique.mockResolvedValue({
      id: "k1",
      teamId: "t1",
      namaKegiatan: "Kegiatan A",
      team: { namaTim: "Tim A" },
    });
    prisma.penugasan.create.mockResolvedValue({ id: "p1" });
    prisma.user.findUnique.mockResolvedValue({
      phone: "08123",
      nama: "Budi",
    });

    const data = {
      kegiatanId: "k1",
      pegawaiId: "u1",
      minggu: 1,
      bulan: 5,
      tahun: 2024,
      deskripsi: "Kerjakan",
    } as any;

    await service.assign(data, "adminUser", "admin");

    expect(whatsappService.sendMessage).toHaveBeenCalledWith(
      "08123",
      `Halo Budi,\n\nAnda mendapat penugasan:\n• Tim: Tim A\n• Kegiatan: Kegiatan A\n• Deskripsi: Kerjakan\n• Link: /tugas-mingguan/p1\n\nSelamat bekerja!\n`
    );
  });

  it("does not send WhatsApp message when pegawai has no phone", async () => {
    prisma.masterKegiatan.findUnique.mockResolvedValue({
      id: "k1",
      teamId: "t1",
      namaKegiatan: "Kegiatan A",
      team: { namaTim: "Tim A" },
    });
    prisma.penugasan.create.mockResolvedValue({ id: "p1" });
    prisma.user.findUnique.mockResolvedValue({});

    const data = {
      kegiatanId: "k1",
      pegawaiId: "u1",
      minggu: 1,
      bulan: 5,
      tahun: 2024,
      deskripsi: "Kerjakan",
    } as any;

    await service.assign(data, "adminUser", "admin");

    expect(whatsappService.sendMessage).not.toHaveBeenCalled();
  });
});
