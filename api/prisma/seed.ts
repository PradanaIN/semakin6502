import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/common/hash";

const prisma = new PrismaClient();

async function main() {
  const hash = hashPassword;

  await prisma.role.createMany({
    data: [
      { name: "admin" },
      { name: "pimpinan" },
      { name: "ketua" },
      { name: "anggota" },
    ],
    skipDuplicates: true,
  });


  // Buat user satu per satu agar dapat userId
  const admin = await prisma.user.create({
    data: {
      nama: "Admin Utama",
      email: "admin@bps.go.id",
      password: await hash("password"),
      role: "admin",
    },
  });

  const pimpinan = await prisma.user.upsert({
    where: { email: "pimpinan@bps.go.id" },
    update: {},
    create: {
      nama: "Pimpinan BPS",
      email: "pimpinan@bps.go.id",
      password: await hash("password"),
      role: "pimpinan",
    },
  });

  const ketuaSosial = await prisma.user.upsert({
    where: { email: "ketua.sosial@bps.go.id" },
    update: {},
    create: {
      nama: "Ketua Tim Sosial",
      email: "ketua.sosial@bps.go.id",
      password: await hash("password"),
      role: "ketua",
    },
  });

  const ketuaIpds = await prisma.user.upsert({
    where: { email: "ketua.ipds@bps.go.id" },
    update: {},
    create: {
      nama: "Ketua Tim IPDS",
      email: "ketua.ipds@bps.go.id",
      password: await hash("password"),
      role: "ketua",
    },
  });

  const anggotaA = await prisma.user.upsert({
    where: { email: "anggota.a@bps.go.id" },
    update: {},
    create: {
      nama: "Anggota A",
      email: "anggota.a@bps.go.id",
      password: await hash("password"),
      role: "anggota",
    },
  });

  const anggotaB = await prisma.user.upsert({
    where: { email: "anggota.b@bps.go.id" },
    update: {},
    create: {
      nama: "Anggota B",
      email: "anggota.b@bps.go.id",
      password: await hash("password"),
      role: "anggota",
    },
  });

  // Teams
  await prisma.team.createMany({
    data: [
      { nama_tim: "Pimpinan" },
      { nama_tim: "Umum" },
      { nama_tim: "Sosial" },
      { nama_tim: "Neraca" },
      { nama_tim: "Produksi" },
      { nama_tim: "Distribusi" },
      { nama_tim: "IPDS" },
      { nama_tim: "Humas" },
    ],
    skipDuplicates: true,
  });

  const sosial = await prisma.team.findFirst({ where: { nama_tim: "Sosial" } });
  const ipds = await prisma.team.findFirst({ where: { nama_tim: "IPDS" } });

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
