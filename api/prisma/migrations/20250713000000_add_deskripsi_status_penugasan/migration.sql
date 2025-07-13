-- Add deskripsi and status columns to Penugasan
ALTER TABLE `Penugasan`
  ADD COLUMN `deskripsi` VARCHAR(191),
  ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'Belum';
