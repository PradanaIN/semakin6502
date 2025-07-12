import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/common/hash";

const prisma = new PrismaClient();

const rawUsers = [
  { nama: "Yuda Agus Irianto", email: "yuda@bps.go.id", username: "yuda", password: "password", team: "Pimpinan", role: "Pimpinan" },
  { nama: "Warsidi", email: "warsidi2@bps.go.id", username: "warsidi2", password: "password", team: "Sosial", role: "Anggota Tim" },
  { nama: "Muhamadsyah", email: "muhamadsyah@bps.go.id", username: "muhamadsyah", password: "password", team: "Neraca", role: "Anggota Tim" },
  { nama: "Dwi Prasetyono", email: "dwipras@bps.go.id", username: "dwipras", password: "password", team: "Produksi", role: "Ketua Tim" },
  { nama: "Tiara Kusuma Widianingrum", email: "tiara.kusuma@bps.go.id", username: "tiara.kusuma", password: "password", team: "Sosial", role: "Ketua Tim" },
  { nama: "Idhamsyah", email: "idhamsyah@bps.go.id", username: "idhamsyah", password: "password", team: "Umum", role: "Anggota Tim" },
  { nama: "Mohammad Agusti Rahman", email: "agusti.rahman@bps.go.id", username: "agusti.rahman", password: "password", team: "Distribusi", role: "Ketua Tim" },
  { nama: "Okta Wahyu Nugraha", email: "okta.nugraha@bps.go.id", username: "okta.nugraha", password: "password", team: "Umum", role: "Anggota Tim" },
  { nama: "Rosetina Fini Alsera", email: "finialsera@bps.go.id", username: "finialsera", password: "password", team: "Umum", role: "Anggota Tim" },
  { nama: "Shafa", email: "sha.fa@bps.go.id", username: "sha.fa", password: "password", team: "Umum", role: "Anggota Tim" },
  { nama: "Ari Susilowati", email: "arisusilo@bps.go.id", username: "arisusilo", password: "password", team: "Umum", role: "Ketua Tim" },
  { nama: "Rifki Maulana", email: "rifki.maulana@bps.go.id", username: "rifki.maulana", password: "password", team: "Neraca", role: "Ketua Tim" },
  { nama: "Sega Purwa Wika", email: "sega.wika@bps.go.id", username: "sega.wika", password: "password", team: "Distribusi", role: "Anggota Tim" },
  { nama: "Alphin Pratama Husada", email: "alphin.pratama@bps.go.id", username: "alphin.pratama", password: "password", team: "Produksi", role: "Anggota Tim" },
  { nama: "Bambang Luhat", email: "bambang_luhat@bps.go.id", username: "bambang_luhat", password: "password", team: "Produksi", role: "Anggota Tim" },
  { nama: "Fachri Izzudin Lazuardi", email: "fachri.lazuardi@bps.go.id", username: "fachri.lazuardi", password: "password", team: "IPDS", role: "Ketua Tim" },
  { nama: "Andi Nurdiansyah", email: "andi.nurdiansyah@bps.go.id", username: "andi.nurdiansyah", password: "password", team: "Sosial", role: "Anggota Tim" },
  { nama: "Afnita Rahma Auliya Putri", email: "afnita.rahma@bps.go.id", username: "afnita.rahma", password: "password", team: "IPDS", role: "Anggota Tim" },
  { nama: "Anissa Nurullya Fernanda", email: "anissa.nurullya@bps.go.id", username: "anissa.nurullya", password: "password", team: "Neraca", role: "Anggota Tim" },
  { nama: "Febri Fatika Sari", email: "febri.fatika@bps.go.id", username: "febri.fatika", password: "password", team: "Distribusi", role: "Anggota Tim" },
  { nama: "Marini Safa Aziza", email: "marinisafa@bps.go.id", username: "marinisafa", password: "password", team: "Sosial", role: "Anggota Tim" },
  { nama: "Najwa Fairus Samaya", email: "najwa.fairus@bps.go.id", username: "najwa.fairus", password: "password", team: "Neraca", role: "Anggota Tim" },
  { nama: "Fiqah Rochmah Ningtyas Duana Putri", email: "fiqah.putri@bps.go.id", username: "fiqah.putri", password: "password", team: "Produksi", role: "Anggota Tim" },
  { nama: "Lia Aulia Hayati", email: "liaauliahayati@bps.go.id", username: "liaauliahayati", password: "password", team: "Produksi", role: "Anggota Tim" },
  { nama: "Mardiana", email: "mar.diana@bps.go.id", username: "mar.diana", password: "password", team: "Distribusi", role: "Anggota Tim" },
  { nama: "Novanni Indi Pradana", email: "novanniindipradana@bps.go.id", username: "novanniindipradana", password: "password", team: "IPDS", role: "Anggota Tim" },
  { nama: "Elly Astutik", email: "elly.astutik@bps.go.id", username: "elly.astutik", password: "password", team: "Umum", role: "Anggota Tim" },
  { nama: "Ayu Pinta Gabina Siregar", email: "ayu.pinta@bps.go.id", username: "ayu.pinta", password: "password", team: "Umum", role: "Anggota Tim" },
];

const roleMap: Record<string, string> = {
  "Pimpinan": "pimpinan",
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
      username: "admin",
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
  const teamMap = new Map(teams.map((t) => [t.nama_tim, t.id]));

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
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
