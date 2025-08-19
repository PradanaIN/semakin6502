import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/common/hash";
import { STATUS } from "../src/common/status.constants";
import { getHolidays } from "../src/utils/holidays";
import { ulid } from "ulid";
import userPhonesData from "./user-phones.json";

const userPhones: Record<string, string> = userPhonesData;

const prisma = new PrismaClient();

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

const rawUsers = baseUsers.map(u => ({ ...u, phone: userPhones[u.nama] }));

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

  // seed penugasan for June to August 2025
  const months = [
    { bulan: "6", monthIndex: 5, year: 2025, days: 30 },
    { bulan: "7", monthIndex: 6, year: 2025, days: 31 },
    { bulan: "8", monthIndex: 7, year: 2025, days: 31 },
  ];

  type WeekRange = { start: number; end: number };
  function getWeekRanges(year: number, monthIndex: number): WeekRange[] {
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const firstDay = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
    const firstWeekEnd = firstDay === 0 ? 7 : 7 - firstDay + 1;
    const weeks: WeekRange[] = [{ start: 1, end: firstWeekEnd }];
    let start = firstWeekEnd;
    if (firstWeekEnd < 7) {
      const end = Math.min(start + 7, daysInMonth);
      weeks.push({ start, end });
      start = end + 1;
    } else {
      start = firstWeekEnd + 1;
    }
    while (start <= daysInMonth) {
      const end = Math.min(start + 6, daysInMonth);
      weeks.push({ start, end });
      start = end + 1;
    }
    return weeks;
  }

  const members = await prisma.member.findMany({ include: { user: true } });
  const leaderByTeam = new Map<string, string>();
  for (const m of members) {
    if (m.isLeader) leaderByTeam.set(m.teamId, m.userId);
  }

  // seed tugas tambahan linked to master kegiatan using explicit dates
  const sampleDates = [
    new Date("2025-06-15T00:00:00Z"),
    new Date("2025-07-14T00:00:00Z"),
    new Date("2025-07-31T00:00:00Z"),
    new Date("2025-08-17T00:00:00Z"),
  ];
  sampleDates.forEach((d) => console.log("Seeded:", d.toISOString()));
  const tambahanRows: any[] = [];
  for (const m of members) {
    if (m.user.role === "admin") continue;
    const masters = await prisma.masterKegiatan.findMany({
      where: { teamId: m.teamId },
    });
    if (!masters.length) continue;

    for (let i = 0; i < sampleDates.length; i++) {
      const k = masters[randomInt(0, masters.length - 1)];
      const date = sampleDates[i];
      const status =
        i === 0
          ? STATUS.BELUM
          : i === 1
          ? STATUS.SEDANG_DIKERJAKAN
          : STATUS.SELESAI_DIKERJAKAN;
      tambahanRows.push({
        id: ulid(),
        nama: k.namaKegiatan,
        tanggal: date.toISOString(),
        status,
        userId: m.userId,
        kegiatanId: k.id,
        teamId: m.teamId,
        deskripsi: `Tugas tambahan ${k.namaKegiatan}`,
        capaianKegiatan: `Capaian ${k.namaKegiatan}`,
      });
    }
  }

  if (tambahanRows.length) {
    await prisma.kegiatanTambahan.createMany({
      data: tambahanRows,
      skipDuplicates: true,
    });

    const laporanTambahanRows = tambahanRows.map((t) => ({
      id: ulid(),
      tambahanId: t.id,
      pegawaiId: t.userId,
      tanggal: t.tanggal,
      status: t.status,
      capaianKegiatan: t.capaianKegiatan,
    }));

    await prisma.laporanHarian.createMany({
      data: laporanTambahanRows,
      skipDuplicates: true,
    });
  }

  const penugasanRows: any[] = [];

  for (const m of members) {
    if (m.user.role === "admin") continue;
    const masters = await prisma.masterKegiatan.findMany({
      where: { teamId: m.teamId },
    });
    if (!masters.length) continue;

    for (const info of months) {
      const weekRanges = getWeekRanges(info.year, info.monthIndex);
      const maxWeeks = ["7", "8"].includes(info.bulan)
        ? Math.min(3, weekRanges.length)
        : weekRanges.length;
      for (let w = 1; w <= maxWeeks; w++) {
        const taskCount = randomInt(5, 7);
        for (let i = 0; i < taskCount; i++) {
          const k = masters[randomInt(0, masters.length - 1)];
          penugasanRows.push({
            id: ulid(),
            kegiatanId: k.id,
            pegawaiId: m.userId,
            creatorId: leaderByTeam.get(m.teamId) || m.userId,
            minggu: w,
            bulan: info.bulan,
            tahun: info.year,
            deskripsi: `Tugas ${k.namaKegiatan}`,
            status: STATUS.BELUM,
          });
        }
      }
    }
  }

  if (penugasanRows.length) {
    await prisma.penugasan.createMany({
      data: penugasanRows,
      skipDuplicates: true,
    });
  }

  // seed laporan harian based on penugasan
  const penugasans = await prisma.penugasan.findMany({
    where: { tahun: 2025, bulan: { in: ["6", "7", "8"] } },
  });

  if (penugasans.length) {
    const laporanRows: any[] = [];
    const selesaiIds = new Set<string>();
    const holidays = new Set(getHolidays(2025));

    for (const m of members) {
      if (m.user.role === "admin") continue;
      for (const info of months) {
        const weekRanges = getWeekRanges(info.year, info.monthIndex);
        const maxWeeks = ["7", "8"].includes(info.bulan)
          ? Math.min(3, weekRanges.length)
          : weekRanges.length;
        for (let w = 1; w <= maxWeeks; w++) {
          const tugas = penugasans.filter(
            (p) =>
              p.pegawaiId === m.userId &&
              p.bulan === info.bulan &&
              p.minggu === w
          );
          if (!tugas.length) continue;
          const { start, end } = weekRanges[w - 1];
          for (let d = start; d <= end; d++) {
            const date = new Date(Date.UTC(info.year, info.monthIndex, d));
            const day = date.getDay();
            const dateStr = date.toISOString().slice(0, 10);
            if (day === 0 || day === 6 || holidays.has(dateStr)) continue;

            const laporanCount = randomInt(1, 3);
            for (let i = 0; i < laporanCount; i++) {
              const p = tugas[randomInt(0, tugas.length - 1)];
              laporanRows.push({
                id: ulid(),
                penugasanId: p.id,
                pegawaiId: m.userId,
                tanggal: date.toISOString(),
                status: STATUS.SELESAI_DIKERJAKAN,
                capaianKegiatan: `Capaian ${p.id}`,
              });
              selesaiIds.add(p.id);
            }
          }
        }
      }
    }

    if (laporanRows.length) {
      await prisma.laporanHarian.createMany({
        data: laporanRows,
        skipDuplicates: true,
      });
    }
    if (selesaiIds.size) {
      await prisma.penugasan.updateMany({
        where: { id: { in: Array.from(selesaiIds) } },
        data: { status: STATUS.SELESAI_DIKERJAKAN },
      });
    }
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
          bulan: { in: ["6", "7", "8"] },
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
