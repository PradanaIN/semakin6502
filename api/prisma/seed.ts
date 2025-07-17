import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/common/hash";

const prisma = new PrismaClient();

const rawUsers = [
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
    nama: "Novanni Indi Pradana",
    email: "novanniindipradana@bps.go.id",
    username: "novanniindipradana",
    password: "password",
    team: "IPDS",
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
];

const roleMap: Record<string, string> = {
  Pimpinan: "pimpinan",
  "Ketua Tim": "ketua",
  "Anggota Tim": "anggota",
};

async function main() {
  await prisma.role.createMany({
    data: [
      { name: "admin" },
      { name: "pimpinan" },
      { name: "ketua" },
      { name: "anggota" },
    ],
    skipDuplicates: true,
  });

  await prisma.user.upsert({
    where: { email: "admin@bps.go.id" },
    update: {},
    create: {
      nama: "Admin Utama",
      email: "admin@bps.go.id",
      username: "admin",
      password: await hashPassword("password"),
      role: "admin",
    },
  });

  const teamNames = Array.from(new Set(rawUsers.map((u) => u.team)));
  await prisma.team.createMany({
    data: teamNames.map((n) => ({ nama_tim: n })),
    skipDuplicates: true,
  });

  const teams = await prisma.team.findMany({ where: { nama_tim: { in: teamNames } } });
  const teamMap = new Map(teams.map((t: any) => [t.nama_tim, t.id]));

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
      "Sakernas Ags",
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
        where: { teamId, nama_kegiatan: nama },
      });
      if (!existing) {
        await prisma.masterKegiatan.create({ data: { teamId, nama_kegiatan: nama } });
      }
    }
  }

  for (const u of rawUsers) {
    const role = roleMap[u.role] || "anggota";
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        nama: u.nama,
        email: u.email,
        username: u.username,
        password: await hashPassword(u.password),
        role,
      },
    });

    const teamId = teamMap.get(u.team);
    if (teamId) {
      await prisma.member.create({
        data: {
          userId: user.id,
          teamId,
          is_leader: role !== "anggota",
        },
      });
    }
  }

  // seed penugasan for June and July 2025
  const months = [
    { bulan: "6", monthIndex: 5, year: 2025, days: 30 },
    { bulan: "7", monthIndex: 6, year: 2025, days: 31 },
  ];

  const members = await prisma.member.findMany({ include: { user: true } });

  // seed tugas tambahan linked to master kegiatan
  const tambahanRows: any[] = [];
  for (const m of members) {
    if (m.user.role === "admin") continue;
    const masters = await prisma.masterKegiatan.findMany({ where: { teamId: m.teamId } });
    if (!masters.length) continue;

    for (let i = 0; i < 3; i++) {
      const k = masters[i % masters.length];
      const info = months[i % months.length];
      const day = ((m.userId + i) % info.days) + 1;
      const date = new Date(Date.UTC(info.year, info.monthIndex, day));
      const status = i === 0 ? "Belum" : i === 1 ? "Sedang Dikerjakan" : "Selesai Dikerjakan";
      tambahanRows.push({
        nama: k.nama_kegiatan,
        tanggal: date.toISOString(),
        status,
        userId: m.userId,
        kegiatanId: k.id,
        teamId: m.teamId,
        deskripsi: `Tugas tambahan ${k.nama_kegiatan}`,
      });
    }
  }

  if (tambahanRows.length) {
    await prisma.kegiatanTambahan.createMany({
      data: tambahanRows,
      skipDuplicates: true,
    });
  }

  const penugasanRows: any[] = [];

  for (const m of members) {
    if (m.user.role === "admin") continue;
    const masters = await prisma.masterKegiatan.findMany({ where: { teamId: m.teamId } });
    if (!masters.length) continue;

    for (const info of months) {
      const weeks = Math.ceil(info.days / 7);
      for (let w = 1; w <= weeks; w++) {
        for (let i = 0; i < 10; i++) {
          const k = masters[(w * 10 + i) % masters.length];
          penugasanRows.push({
            kegiatanId: k.id,
            pegawaiId: m.userId,
            minggu: w,
            bulan: info.bulan,
            tahun: info.year,
            deskripsi: `Tugas ${k.nama_kegiatan}`,
            status: "Belum",
          });
        }
      }
    }
  }

  if (penugasanRows.length) {
    await prisma.penugasan.createMany({ data: penugasanRows, skipDuplicates: true });
  }

  // seed laporan harian based on penugasan
  const penugasans = await prisma.penugasan.findMany({
    where: { tahun: 2025, bulan: { in: ["6", "7"] } },
  });

  if (penugasans.length) {
    const laporanRows: any[] = [];
    for (const p of penugasans) {
      const info = months.find((m) => m.bulan === p.bulan);
      if (!info) continue;
      const start = 1 + (p.minggu - 1) * 7;
      const end = Math.min(start + 6, info.days);
      for (let d = start; d <= end; d++) {
        const date = new Date(Date.UTC(info.year, info.monthIndex, d));
        laporanRows.push({
          penugasanId: p.id,
          pegawaiId: p.pegawaiId,
          tanggal: date.toISOString(),
          status: "Belum Dikerjakan",
        });
      }
    }
    if (laporanRows.length) {
      await prisma.laporanHarian.createMany({ data: laporanRows, skipDuplicates: true });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
