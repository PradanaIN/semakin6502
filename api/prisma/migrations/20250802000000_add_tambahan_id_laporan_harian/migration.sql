ALTER TABLE `LaporanHarian`
  ADD COLUMN `tambahanId` VARCHAR(191);

ALTER TABLE `LaporanHarian`
  ADD CONSTRAINT `LaporanHarian_tambahanId_fkey` FOREIGN KEY (`tambahanId`) REFERENCES `KegiatanTambahan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
