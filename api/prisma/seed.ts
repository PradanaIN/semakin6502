import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/common/hash.js";
import { STATUS } from "../src/common/status.constants.js";
import { getHolidays } from "../src/utils/holidays.js";
import { ulid } from "ulid";
import userPhonesData from "./user-phones.json";

const userPhones: Record<string, string> = userPhonesData;

const prisma = new PrismaClient();

const BASE_URL = process.env.BASE_URL || "https://semakin.databenuanta.id";

const BASE_DATE = new Date("2025-08-17T00:00:00Z");
BASE_DATE.setUTCHours(0, 0, 0, 0);

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const baseUsers = [
  {
    nama: "Yuda Agus Irianto",
    email: "yuda@bps.go.id",
    username: "yuda",
    password: "password",
    team: "Pimpinan",
    role: "Pimpinan",
  },
  {
    nama: "Warsidi",
    email: "warsidi2@bps.go.id",
    username: "warsidi2",
    password: "password",
    team: "Sosial",
    role: "Anggota Tim",
  },
  {
    nama: "Muhamadsyah",
    email: "muhamadsyah@bps.go.id",
    username: "muhamadsyah",
    password: "password",
    team: "Neraca",
    role: "Anggota Tim",
  },
  {
    nama: "Dwi Prasetyono",
    email: "dwipras@bps.go.id",
    username: "dwipras",
    password: "password",
    team: "Produksi",
    role: "Ketua Tim",
  },
  {
    nama: "Tiara Kusuma Widianingrum",
    email: "tiara.kusuma@bps.go.id",
    username: "tiara.kusuma",
    password: "password",
    team: "Sosial",
    role: "Ketua Tim",
  },
  {
    nama: "Idhamsyah",
    email: "idhamsyah@bps.go.id",
    username: "idhamsyah",
    password: "password",
    team: "Umum",
    role: "Anggota Tim",
  },
  {
    nama: "Mohammad Agusti Rahman",
    email: "agusti.rahman@bps.go.id",
    username: "agusti.rahman",
    password: "password",
    team: "Distribusi",
    role: "Ketua Tim",
  },
  {
    nama: "Okta Wahyu Nugraha",
    email: "okta.nugraha@bps.go.id",
    username: "okta.nugraha",
    password: "password",
    team: "Umum",
    role: "Anggota Tim",
  },
  {
    nama: "Rosetina Fini Alsera",
    email: "finialsera@bps.go.id",
    username: "finialsera",
    password: "password",
    team: "Umum",
    role: "Anggota Tim",
  },
  {
    nama: "Shafa",
    email: "sha.fa@bps.go.id",
    username: "sha.fa",
    password: "password",
    team: "Umum",
    role: "Anggota Tim",
  },
  {
    nama: "Ari Susilowati",
    email: "arisusilo@bps.go.id",
    username: "arisusilo",
    password: "password",
    team: "Umum",
    role: "Ketua Tim",
  },
  {
    nama: "Rifki Maulana",
    email: "rifki.maulana@bps.go.id",
    username: "rifki.maulana",
    password: "password",
    team: "Neraca",
    role: "Ketua Tim",
  },
  {
    nama: "Sega Purwa Wika",
    email: "sega.wika@bps.go.id",
    username: "sega.wika",
    password: "password",
    team: "Distribusi",
    role: "Anggota Tim",
  },
  {
    nama: "Alphin Pratama Husada",
    email: "alphin.pratama@bps.go.id",
    username: "alphin.pratama",
    password: "password",
    team: "Produksi",
    role: "Anggota Tim",
  },
  {
    nama: "Bambang Luhat",
    email: "bambang_luhat@bps.go.id",
    username: "bambang_luhat",
    password: "password",
    team: "Produksi",
    role: "Anggota Tim",
  },
  {
    nama: "Fachri Izzudin Lazuardi",
    email: "fachri.lazuardi@bps.go.id",
    username: "fachri.lazuardi",
    password: "password",
    team: "IPDS",
    role: "Ketua Tim",
  },
  {
    nama: "Andi Nurdiansyah",
    email: "andi.nurdiansyah@bps.go.id",
    username: "andi.nurdiansyah",
    password: "password",
    team: "Sosial",
    role: "Anggota Tim",
  },
  {
    nama: "Afnita Rahma Auliya Putri",
    email: "afnita.rahma@bps.go.id",
    username: "afnita.rahma",
    password: "password",
    team: "IPDS",
    role: "Anggota Tim",
  },
  {
    nama: "Anissa Nurullya Fernanda",
    email: "anissa.nurullya@bps.go.id",
    username: "anissa.nurullya",
    password: "password",
    team: "Neraca",
    role: "Anggota Tim",
  },
  {
    nama: "Febri Fatika Sari",
    email: "febri.fatika@bps.go.id",
    username: "febri.fatika",
    password: "password",
    team: "Distribusi",
    role: "Anggota Tim",
  },
  {
    nama: "Marini Safa Aziza",
    email: "marinisafa@bps.go.id",
    username: "marinisafa",
    password: "password",
    team: "Sosial",
    role: "Anggota Tim",
  },
  {
    nama: "Najwa Fairus Samaya",
    email: "najwa.fairus@bps.go.id",
    username: "najwa.fairus",
    password: "password",
    team: "Neraca",
    role: "Anggota Tim",
  },
  {
    nama: "Fiqah Rochmah Ningtyas Duana Putri",
    email: "fiqah.putri@bps.go.id",
    username: "fiqah.putri",
    password: "password",
    team: "Produksi",
    role: "Anggota Tim",
  },
  {
    nama: "Lia Aulia Hayati",
    email: "liaauliahayati@bps.go.id",
    username: "liaauliahayati",
    password: "password",
    team: "Produksi",
    role: "Anggota Tim",
  },
  {
    nama: "Mardiana",
    email: "mar.diana@bps.go.id",
    username: "mar.diana",
    password: "password",
    team: "Distribusi",
    role: "Anggota Tim",
  },
  {
    nama: "Elly Astutik",
    email: "elly.astutik@bps.go.id",
    username: "elly.astutik",
    password: "password",
    team: "Umum",
    role: "Anggota Tim",
  },
  {
    nama: "Ayu Pinta Gabina Siregar",
    email: "ayu.pinta@bps.go.id",
    username: "ayu.pinta",
    password: "password",
    team: "Umum",
    role: "Anggota Tim",
  },
  {
    nama: "Novanni Indi Pradana",
    email: "novanniindipradana@bps.go.id",
    username: "novanniindipradana",
    password: "password",
    team: "IPDS",
    role: "Anggota Tim",
  },
];

const rawUsers = baseUsers.map((u) => ({ ...u, phone: userPhones[u.nama] }));

const roleMap: Record<string, string> = {
  Pimpinan: "pimpinan",
  "Ketua Tim": "ketua",
  "Anggota Tim": "anggota",
};

async function main() {
  await prisma.role.createMany({
    data: [
      { id: ulid(), name: "admin" },
      { id: ulid(), name: "pimpinan" },
      { id: ulid(), name: "ketua" },
      { id: ulid(), name: "anggota" },
    ],
    skipDuplicates: true,
  });

  await prisma.user.upsert({
    where: { email: "admin@bps.go.id" },
    update: {},
    create: {
      id: ulid(),
      nama: "Admin Utama",
      email: "admin@bps.go.id",
      username: "admin",
      password: await hashPassword("password"),
      role: "admin",
    },
  });

  const teamNames = Array.from(new Set(rawUsers.map((u) => u.team)));
  await prisma.team.createMany({
    data: teamNames.map((n) => ({ id: ulid(), namaTim: n })),
    skipDuplicates: true,
  });

  const teams = await prisma.team.findMany({
    where: { namaTim: { in: teamNames } },
  });
  const teamMap = new Map(teams.map((t: any) => [t.namaTim, t.id]));

  const kegiatanByTeam: Record<string, string[]> = {
    Umum: [
      "SAKIP",
      "SPI",
      "Keuangan",
      "Kepegawaian",
      "Kehumasan",
      "Kearsipan",
      "BMN",
      "Pengadaan barang dan jasa",
      "Rapat/Sosialisasi",
      "TB",
      "Apel/Upacara",
      "Anggaran",
      "Rapat",
      "ZI",
      "Monev",
    ],
    Sosial: [
      "Susenas Maret",
      "Susenas Sep",
      "Seruti Tw I",
      "Seruti Tw II",
      "Seruti Tw III",
      "Seruti Tw IV",
      "Podes",
      "Polkam",
      "Sakernas Feb",
      "Sakernas Agustus",
      "Supas",
      "Desa Cantik",
    ],
    Distribusi: [
      "SHK",
      "SHP",
      "SHPED",
      "SHPB",
      "SHMP",
      "VHTS",
      "VHTL",
      "SIMOPPEL",
      "LLAU",
      "SHKK",
      "SVPEB",
      "VPBD",
      "VPEK",
      "PJ II/5",
      "SKP",
      "SVK",
      "SLK-KSP",
      "VREST",
      "SLK-BUMD",
      "K3",
      "ECOMMERCE",
      "UPD PARIWISATA",
      "SBR",
      "SE2026",
      "POLDIS",
    ],
    Produksi: [
      "SKTH",
      "KOMSTRAT",
      "UPDATING DIREKTORI PERUSAHAAN AWAL",
      "SIMENTAL",
      "VN HORTI",
      "CAPTIVE POWER",
      "IBS",
      "AIR BERSIH TAHUNAN",
      "PENGGALIAN URT",
      "IMK TAHUNAN",
      "RAPAT & KOORDINASI",
      "SKTR",
      "KSA",
      "UBINAN",
      "STPIM",
      "SIUTAN-PBPH",
      "SIM-TP",
      "SPH",
      "UDPE",
      "MIGAS",
      "NON MIGAS",
      "IMK TRIWULANAN",
      "PENGGALIAN BERBADAN HUKUM TRIWULANAN",
      "BRIEFING IMK TAHUNAN",
    ],
    Neraca: [
      "Neraca Produksi",
      "Neraca Pengeluaran",
      "Analisis Lintas Sektor",
      "Penjaminan Kualitas QG",
    ],
    IPDS: [
      "Wilkerstat SE2026",
      "Pembinaan Statistik Sektoral",
      "Metadata dan Romantik",
      "KCDA",
      "SPBE",
      "PEKPPP",
      "PST",
      "Pengolahan",
    ],
  };

  for (const [teamName, kegiatan] of Object.entries(kegiatanByTeam)) {
    const teamId = teamMap.get(teamName);
    if (!teamId) continue;
    for (const nama of kegiatan) {
      const existing = await prisma.masterKegiatan.findFirst({
        where: { teamId, namaKegiatan: nama },
      });
      if (!existing) {
        await prisma.masterKegiatan.create({
          data: { id: ulid(), teamId, namaKegiatan: nama },
        });
      }
    }
  }

  const memberRows: any[] = [];
  for (const u of rawUsers) {
    const role = roleMap[u.role] || "anggota";
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { phone: u.phone },
      create: {
        id: ulid(),
        nama: u.nama,
        email: u.email,
        username: u.username,
        password: await hashPassword(u.password),
        role,
        phone: u.phone,
      },
    });

    const teamId = teamMap.get(u.team);
    if (teamId) {
      memberRows.push({
        id: ulid(),
        userId: user.id,
        teamId,
        isLeader: role !== "anggota",
      });
    }
  }

  if (memberRows.length) {
    await prisma.member.createMany({ data: memberRows, skipDuplicates: true });
  }

  // seed penugasan for July to September 2025
  const months = [
    { bulan: "7", monthIndex: 6, year: 2025, days: 31 },
    { bulan: "8", monthIndex: 7, year: 2025, days: 31 },
    {
      bulan: "9",
      monthIndex: 8,
      year: 2025,
      days: 30,
      weeks: [
        { start: 1, end: 7 },
        { start: 8, end: 14 },
      ],
    },
  ];

  type WeekRange = { start: number; end: number };
  function getWeekRanges(
    year: number,
    monthIndex: number,
    weeks?: WeekRange[]
  ): WeekRange[] {
    if (weeks) return weeks;
    const daysInMonth = new Date(
      Date.UTC(year, monthIndex + 1, 0)
    ).getUTCDate();
    const firstDay = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
    const firstWeekEnd = firstDay === 0 ? 7 : 7 - firstDay + 1;
    const result: WeekRange[] = [{ start: 1, end: firstWeekEnd }];
    let start = firstWeekEnd;
    if (firstWeekEnd < 7) {
      const end = Math.min(start + 7, daysInMonth);
      result.push({ start, end });
      start = end + 1;
    } else {
      start = firstWeekEnd + 1;
    }
    while (start <= daysInMonth) {
      const end = Math.min(start + 6, daysInMonth);
      result.push({ start, end });
      start = end + 1;
    }
    return result;
  }

  const members = await prisma.member.findMany({ include: { user: true } });
  const leaderByTeam = new Map<string, string>();
  for (const m of members) {
    if (m.isLeader) leaderByTeam.set(m.teamId, m.userId);
  }

  const holidays = new Set(getHolidays(2025));

  const tambahanRows: any[] = [];
  const laporanTambahanRows: any[] = [];
  const penugasanRows: any[] = [];
  const laporanPenugasanRows: any[] = [];
  const selesaiPenugasanIds = new Set<string>();

  // maps member-month-week to assignments for laporan generation
  const penugasanMap = new Map<string, any[]>();

  // prepare member subsets for September week 2 scenarios
  const nonAdminMembers = members.filter((m) => m.user.role !== "admin");
  const mid = Math.ceil(nonAdminMembers.length / 2);
  const scenario1Members = nonAdminMembers.slice(0, mid);
  const scenario2Members = nonAdminMembers.slice(mid);

  for (const m of nonAdminMembers) {
    const masters = await prisma.masterKegiatan.findMany({
      where: { teamId: m.teamId },
    });
    if (!masters.length) continue;

    for (const info of months) {
      const weekRanges = getWeekRanges(info.year, info.monthIndex, info.weeks);
      const weeksToProcess = weekRanges.length;
      for (let w = 1; w <= weeksToProcess; w++) {
        // penugasan 5-7 per week
        const taskCount = randomInt(5, 7);
        const key = `${m.userId}-${info.bulan}-${w}`;
        const arr: any[] = [];
        for (let i = 0; i < taskCount; i++) {
          const k = masters[randomInt(0, masters.length - 1)];
          const id = ulid();
          const row = {
            id,
            kegiatanId: k.id,
            pegawaiId: m.userId,
            creatorId: leaderByTeam.get(m.teamId) || m.userId,
            minggu: w,
            bulan: info.bulan,
            tahun: info.year,
            deskripsi: `Tugas ${k.namaKegiatan}`,
            status: STATUS.BELUM,
          };
          penugasanRows.push(row);
          arr.push(row);
        }
        penugasanMap.set(key, arr);

        // tambahan at least one per week
        const { start, end } = weekRanges[w - 1];
        const day = randomInt(start, end);
        const date = new Date(Date.UTC(info.year, info.monthIndex, day));
        const statusOptions = [
          STATUS.BELUM,
          STATUS.SEDANG_DIKERJAKAN,
          STATUS.SELESAI_DIKERJAKAN,
        ];
        const tStatus = statusOptions[randomInt(0, statusOptions.length - 1)];
        const kTambahan = masters[randomInt(0, masters.length - 1)];
        const tambahanId = ulid();
        const tambahan = {
          id: tambahanId,
          nama: kTambahan.namaKegiatan,
          tanggal: date.toISOString(),
          status: tStatus,
          buktiLink: tStatus === STATUS.BELUM ? undefined : `${BASE_URL}/bukti`,
          userId: m.userId,
          kegiatanId: kTambahan.id,
          teamId: m.teamId,
          deskripsi: `Tugas tambahan ${kTambahan.namaKegiatan}`,
          capaianKegiatan: `Capaian ${kTambahan.namaKegiatan}`,
        };
        tambahanRows.push(tambahan);
        laporanTambahanRows.push({
          id: ulid(),
          tambahanId: tambahan.id,
          pegawaiId: m.userId,
          tanggal: tambahan.tanggal,
          status: tambahan.status,
          capaianKegiatan: tambahan.capaianKegiatan,
          buktiLink: tambahan.buktiLink,
        });
      }
    }
  }

  if (penugasanRows.length) {
    await prisma.penugasan.createMany({
      data: penugasanRows,
      skipDuplicates: true,
    });
  }

  if (tambahanRows.length) {
    await prisma.kegiatanTambahan.createMany({
      data: tambahanRows,
      skipDuplicates: true,
    });
    await prisma.laporanHarian.createMany({
      data: laporanTambahanRows,
      skipDuplicates: true,
    });
    // synchronize status with latest laporan
    for (const t of tambahanRows) {
      await prisma.kegiatanTambahan.update({
        where: { id: t.id },
        data: { status: t.status },
      });
    }
  }

  // generate laporan harian for penugasan
  for (const info of months) {
    const weekRanges = getWeekRanges(info.year, info.monthIndex, info.weeks);
    // week 1 reports for all months
    const week1 = weekRanges[0];
    for (const m of nonAdminMembers) {
      const tugas = penugasanMap.get(`${m.userId}-${info.bulan}-1`);
      if (!tugas || !tugas.length) continue;
      for (let d = week1.start; d <= week1.end; d++) {
        const date = new Date(Date.UTC(info.year, info.monthIndex, d));
        const day = date.getUTCDay();
        const dateStr = date.toISOString().slice(0, 10);
        if (day === 0 || day === 6 || holidays.has(dateStr)) continue;
        const p = tugas[randomInt(0, tugas.length - 1)];
        laporanPenugasanRows.push({
          id: ulid(),
          penugasanId: p.id,
          pegawaiId: m.userId,
          tanggal: date.toISOString(),
          status: STATUS.SELESAI_DIKERJAKAN,
          capaianKegiatan: `Capaian ${p.id}`,
          buktiLink: `${BASE_URL}/bukti`,
        });
        selesaiPenugasanIds.add(p.id);
      }
    }

    // September week 2 special handling
    if (info.bulan === "9" && weekRanges[1]) {
      const week2 = weekRanges[1];
      const scenario1Days = [8, 9, 10];
      const scenario2Days = [9, 10];
      for (const m of scenario1Members) {
        const tugas = penugasanMap.get(`${m.userId}-9-2`);
        if (!tugas || !tugas.length) continue;
        for (const d of scenario1Days) {
          if (d < week2.start || d > week2.end) continue;
          const date = new Date(Date.UTC(info.year, info.monthIndex, d));
          const p = tugas[randomInt(0, tugas.length - 1)];
          laporanPenugasanRows.push({
            id: ulid(),
            penugasanId: p.id,
            pegawaiId: m.userId,
            tanggal: date.toISOString(),
            status: STATUS.SELESAI_DIKERJAKAN,
            capaianKegiatan: `Capaian ${p.id}`,
            buktiLink: `${BASE_URL}/bukti`,
          });
          selesaiPenugasanIds.add(p.id);
        }
      }
      for (const m of scenario2Members) {
        const tugas = penugasanMap.get(`${m.userId}-9-2`);
        if (!tugas || !tugas.length) continue;
        for (const d of scenario2Days) {
          if (d < week2.start || d > week2.end) continue;
          const date = new Date(Date.UTC(info.year, info.monthIndex, d));
          const p = tugas[randomInt(0, tugas.length - 1)];
          laporanPenugasanRows.push({
            id: ulid(),
            penugasanId: p.id,
            pegawaiId: m.userId,
            tanggal: date.toISOString(),
            status: STATUS.SELESAI_DIKERJAKAN,
            capaianKegiatan: `Capaian ${p.id}`,
            buktiLink: `${BASE_URL}/bukti`,
          });
          selesaiPenugasanIds.add(p.id);
        }
      }
    }
  }

  if (laporanPenugasanRows.length) {
    await prisma.laporanHarian.createMany({
      data: laporanPenugasanRows,
      skipDuplicates: true,
    });
  }

  if (selesaiPenugasanIds.size) {
    await prisma.penugasan.updateMany({
      where: { id: { in: Array.from(selesaiPenugasanIds) } },
      data: { status: STATUS.SELESAI_DIKERJAKAN },
    });
  }

  // Assign some members late laporan_harian before BASE_DATE to simulate
  // late reports using existing penugasan. Members are randomly selected to be late by 1, 3 or 7 days.
  const lateGroups = [
    { offset: 1, count: 10 },
    { offset: 3, count: 5 },
    { offset: 7, count: 3 },
  ];
  const eligibleMembers = members.filter(
    (m) => m.user.role !== "admin" && m.user.role !== "pimpinan"
  );

  // Shuffle members to ensure random selection
  for (let i = eligibleMembers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [eligibleMembers[i], eligibleMembers[j]] = [
      eligibleMembers[j],
      eligibleMembers[i],
    ];
  }

  let idx = 0;
  for (const group of lateGroups) {
    for (let c = 0; c < group.count && idx < eligibleMembers.length; c++) {
      const m = eligibleMembers[idx++];
      const daysAgo = group.offset;

      const penugasan = await prisma.penugasan.findFirst({
        where: {
          pegawaiId: m.userId,
          tahun: 2025,
          bulan: { in: ["7", "8", "9"] },
        },
      });
      if (!penugasan) continue;

      const tanggal = new Date(BASE_DATE);
      tanggal.setUTCDate(tanggal.getUTCDate() - daysAgo);

      await prisma.laporanHarian.deleteMany({
        where: { pegawaiId: m.userId, tanggal: { gt: tanggal.toISOString() } },
      });

      await prisma.laporanHarian.create({
        data: {
          id: ulid(),
          penugasanId: penugasan.id,
          pegawaiId: m.userId,
          tanggal: tanggal.toISOString(),
          status: STATUS.SELESAI_DIKERJAKAN,
          capaianKegiatan: `Capaian ${penugasan.id}`,
          buktiLink: BASE_URL,
        },
      });
    }
  } // <-- Correct closing brace for the outer for loop
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
