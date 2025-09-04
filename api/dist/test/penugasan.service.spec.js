"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const penugasan_service_1 = require("../src/kegiatan/penugasan.service");
const common_1 = require("@nestjs/common");
const prisma = {
    penugasan: { findUnique: jest.fn(), delete: jest.fn(), create: jest.fn() },
    member: { findFirst: jest.fn() },
    laporanHarian: { count: jest.fn() },
    masterKegiatan: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
};
const notifications = { create: jest.fn() };
const whatsappService = { sendMessage: jest.fn() };
const config = {
    get: jest.fn((key) => key === "PHONE_VALIDATION_ENABLED" ? false : ""),
};
const service = new penugasan_service_1.PenugasanService(prisma, notifications, whatsappService, config);
describe("PenugasanService remove", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        config.get.mockImplementation((key) => key === "PHONE_VALIDATION_ENABLED" ? false : "");
    });
    it("throws BadRequestException when laporan harian exists", async () => {
        prisma.penugasan.findUnique.mockResolvedValue({
            id: "1",
            kegiatan: { teamId: "2" },
        });
        prisma.member.findFirst.mockResolvedValue({ id: "1" });
        prisma.laporanHarian.count.mockResolvedValue(1);
        const action = service.remove("1", "1", "admin");
        await expect(action).rejects.toThrow(common_1.BadRequestException);
        await expect(action).rejects.toThrow("Hapus laporan harian penugasan ini terlebih dahulu");
        expect(prisma.penugasan.delete).not.toHaveBeenCalled();
    });
});
describe("PenugasanService invalidateCache", () => {
    it("falls back to store.reset when cache.reset is missing", async () => {
        const store = { reset: jest.fn().mockResolvedValue(undefined) };
        const cache = { store, del: jest.fn() };
        const svc = new penugasan_service_1.PenugasanService(prisma, notifications, whatsappService, config, cache);
        await expect(svc.invalidateCache()).resolves.toBeUndefined();
        expect(store.reset).toHaveBeenCalledTimes(1);
    });
});
describe("PenugasanService assign", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        config.get.mockImplementation((key) => key === "PHONE_VALIDATION_ENABLED" ? false : "");
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
        };
        await service.assign(data, "adminUser", "admin");
        expect(whatsappService.sendMessage).toHaveBeenCalledWith("08123", `Halo, Budi!\n\nAnda mendapat penugasan:\n\n👥 Tim: Tim A\n📌 Kegiatan: Kegiatan A\n📝 Deskripsi: Kerjakan\n🔗  Link: /tugas-mingguan/p1\n\nSelamat bekerja & tetap semangat!\n`);
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
        };
        await service.assign(data, "adminUser", "admin");
        expect(whatsappService.sendMessage).not.toHaveBeenCalled();
    });
});
