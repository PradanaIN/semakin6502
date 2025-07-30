-- Add capaianKegiatan columns
ALTER TABLE `LaporanHarian`
  ADD COLUMN `capaianKegiatan` VARCHAR(191) NOT NULL DEFAULT '';

ALTER TABLE `KegiatanTambahan`
  ADD COLUMN `capaianKegiatan` VARCHAR(191) NOT NULL DEFAULT '';
