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
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const hash = (pwd) => bcrypt.hash(pwd, 10);
    // Buat user satu per satu agar dapat userId
    const admin = await prisma.user.create({
        data: {
            nama: "Admin Utama",
            email: "admin@bps.go.id",
            password: await hash("password"),
            role: "admin",
        },
    });
    const pimpinan = await prisma.user.create({
        data: {
            nama: "Pimpinan BPS",
            email: "pimpinan@bps.go.id",
            password: await hash("password"),
            role: "pimpinan",
        },
    });
    const ketuaSosial = await prisma.user.create({
        data: {
            nama: "Ketua Tim Sosial",
            email: "ketua.sosial@bps.go.id",
            password: await hash("password"),
            role: "ketua",
        },
    });
    const ketuaIpds = await prisma.user.create({
        data: {
            nama: "Ketua Tim IPDS",
            email: "ketua.ipds@bps.go.id",
            password: await hash("password"),
            role: "ketua",
        },
    });
    const anggotaA = await prisma.user.create({
        data: {
            nama: "Anggota A",
            email: "anggota.a@bps.go.id",
            password: await hash("password"),
            role: "anggota",
        },
    });
    const anggotaB = await prisma.user.create({
        data: {
            nama: "Anggota B",
            email: "anggota.b@bps.go.id",
            password: await hash("password"),
            role: "anggota",
        },
    });
    // Teams
    const sosial = await prisma.team.create({ data: { nama_tim: "Sosial" } });
    const ipds = await prisma.team.create({ data: { nama_tim: "IPDS" } });
    // Members
    await prisma.member.createMany({
        data: [
            { userId: ketuaSosial.id, teamId: sosial.id, is_leader: true },
            { userId: ketuaIpds.id, teamId: ipds.id, is_leader: true },
            { userId: anggotaA.id, teamId: sosial.id, is_leader: false },
            { userId: anggotaB.id, teamId: ipds.id, is_leader: false },
        ],
    });
    // Master Kegiatan
    const kegiatanSosial1 = await prisma.masterKegiatan.create({
        data: { teamId: sosial.id, nama_kegiatan: "Pendataan Sosial Ekonomi" },
    });
    const kegiatanSosial2 = await prisma.masterKegiatan.create({
        data: { teamId: sosial.id, nama_kegiatan: "Pengolahan Data Survei" },
    });
    const kegiatanIpds1 = await prisma.masterKegiatan.create({
        data: { teamId: ipds.id, nama_kegiatan: "Pemetaan Digital IPDS" },
    });
    const kegiatanIpds2 = await prisma.masterKegiatan.create({
        data: { teamId: ipds.id, nama_kegiatan: "Pemeliharaan Sistem Statistik" },
    });
    // Penugasan
    const tugasA = await prisma.penugasan.create({
        data: {
            kegiatanId: kegiatanSosial1.id,
            pegawaiId: anggotaA.id,
            minggu: 1,
            bulan: "Juni",
            tahun: 2025,
        },
    });
    const tugasB = await prisma.penugasan.create({
        data: {
            kegiatanId: kegiatanSosial2.id,
            pegawaiId: anggotaA.id,
            minggu: 1,
            bulan: "Juni",
            tahun: 2025,
        },
    });
    const tugasC = await prisma.penugasan.create({
        data: {
            kegiatanId: kegiatanIpds1.id,
            pegawaiId: anggotaB.id,
            minggu: 1,
            bulan: "Juni",
            tahun: 2025,
        },
    });
    // Laporan Harian
    await prisma.laporanHarian.createMany({
        data: [
            {
                penugasanId: tugasA.id,
                tanggal: new Date("2025-06-02"),
                status: "Selesai Dikerjakan",
                bukti_link: "http://link.com/bukti1",
                catatan: "Tuntas",
                pegawaiId: anggotaA.id,
            },
            {
                penugasanId: tugasB.id,
                tanggal: new Date("2025-06-02"),
                status: "Sedang Dikerjakan",
                bukti_link: "http://link.com/bukti2",
                catatan: "",
                pegawaiId: anggotaA.id,
            },
            {
                penugasanId: tugasC.id,
                tanggal: new Date("2025-06-03"),
                status: "Belum Dikerjakan",
                bukti_link: null,
                catatan: "",
                pegawaiId: anggotaB.id,
            },
        ],
    });
    // Kegiatan Tambahan
    await prisma.kegiatanTambahan.createMany({
        data: [
            {
                nama: "Penyusunan Laporan Internal",
                tanggal: new Date("2025-06-04"),
                status: "Selesai Dikerjakan",
                bukti_link: "http://link.com/bukti3",
                userId: anggotaA.id,
            },
            {
                nama: "Pelatihan Statistik",
                tanggal: new Date("2025-06-04"),
                status: "Sedang Dikerjakan",
                bukti_link: null,
                userId: anggotaB.id,
            },
        ],
    });
}
main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
