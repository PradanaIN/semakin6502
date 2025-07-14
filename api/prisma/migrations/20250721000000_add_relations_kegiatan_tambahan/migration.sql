ALTER TABLE `KegiatanTambahan`
  ADD COLUMN `kegiatanId` INTEGER NOT NULL,
  ADD COLUMN `teamId` INTEGER NOT NULL,
  ADD CONSTRAINT `KegiatanTambahan_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `MasterKegiatan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `KegiatanTambahan_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
