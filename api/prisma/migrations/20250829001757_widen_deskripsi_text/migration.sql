-- DropForeignKey
ALTER TABLE `laporanharian` DROP FOREIGN KEY `LaporanHarian_penugasanId_fkey`;

-- AddForeignKey
ALTER TABLE `LaporanHarian` ADD CONSTRAINT `LaporanHarian_penugasanId_fkey` FOREIGN KEY (`penugasanId`) REFERENCES `Penugasan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
