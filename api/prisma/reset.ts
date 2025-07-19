import 'dotenv/config';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Urutan penghapusan harus diperhatikan agar tidak melanggar foreign key
  await prisma.kegiatanTambahan.deleteMany();
  await prisma.laporanHarian.deleteMany();
  await prisma.penugasan.deleteMany();
  await prisma.masterKegiatan.deleteMany();
  await prisma.member.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Semua data berhasil dihapus.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
