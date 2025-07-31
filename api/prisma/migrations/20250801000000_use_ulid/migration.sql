-- Drop existing tables to recreate with string IDs
DROP TABLE IF EXISTS `Notification`;
DROP TABLE IF EXISTS `KegiatanTambahan`;
DROP TABLE IF EXISTS `LaporanHarian`;
DROP TABLE IF EXISTS `Penugasan`;
DROP TABLE IF EXISTS `MasterKegiatan`;
DROP TABLE IF EXISTS `Member`;
DROP TABLE IF EXISTS `Team`;
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS `Role`;

CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `nama` VARCHAR(191) NOT NULL,
  `username` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `User_username_key`(`username`),
  UNIQUE INDEX `User_email_key`(`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Team` (
  `id` VARCHAR(191) NOT NULL,
  `namaTim` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Member` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `teamId` VARCHAR(191) NOT NULL,
  `isLeader` BOOLEAN NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Member_userId_teamId_key`(`userId`,`teamId`),
  CONSTRAINT `Member_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Member_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MasterKegiatan` (
  `id` VARCHAR(191) NOT NULL,
  `teamId` VARCHAR(191) NOT NULL,
  `namaKegiatan` VARCHAR(191) NOT NULL,
  `deskripsi` VARCHAR(191),
  PRIMARY KEY (`id`),
  CONSTRAINT `MasterKegiatan_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Penugasan` (
  `id` VARCHAR(191) NOT NULL,
  `kegiatanId` VARCHAR(191) NOT NULL,
  `pegawaiId` VARCHAR(191) NOT NULL,
  `creatorId` VARCHAR(191) NOT NULL,
  `minggu` INTEGER NOT NULL,
  `bulan` VARCHAR(191) NOT NULL,
  `tahun` INTEGER NOT NULL,
  `deskripsi` VARCHAR(191),
  `status` VARCHAR(191) NOT NULL DEFAULT 'Belum',
  PRIMARY KEY (`id`),
  CONSTRAINT `Penugasan_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `MasterKegiatan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Penugasan_pegawaiId_fkey` FOREIGN KEY (`pegawaiId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Penugasan_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `LaporanHarian` (
  `id` VARCHAR(191) NOT NULL,
  `penugasanId` VARCHAR(191) NOT NULL,
  `tanggal` DATETIME(3) NOT NULL,
  `status` VARCHAR(191) NOT NULL,
  `capaianKegiatan` VARCHAR(191) NOT NULL DEFAULT '',
  `deskripsi` VARCHAR(191),
  `buktiLink` VARCHAR(191),
  `catatan` VARCHAR(191),
  `pegawaiId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `LaporanHarian_penugasanId_fkey` FOREIGN KEY (`penugasanId`) REFERENCES `Penugasan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `LaporanHarian_pegawaiId_fkey` FOREIGN KEY (`pegawaiId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `KegiatanTambahan` (
  `id` VARCHAR(191) NOT NULL,
  `nama` VARCHAR(191) NOT NULL,
  `tanggal` DATETIME(3) NOT NULL,
  `status` VARCHAR(191) NOT NULL,
  `capaianKegiatan` VARCHAR(191) NOT NULL DEFAULT '',
  `buktiLink` VARCHAR(191),
  `deskripsi` VARCHAR(191),
  `tanggalSelesai` DATETIME(3),
  `tanggalSelesaiAkhir` DATETIME(3),
  `userId` VARCHAR(191) NOT NULL,
  `kegiatanId` VARCHAR(191) NOT NULL,
  `teamId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `KegiatanTambahan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `KegiatanTambahan_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `MasterKegiatan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `KegiatanTambahan_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Role` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Role_name_key`(`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Notification` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `text` VARCHAR(191) NOT NULL,
  `link` VARCHAR(191),
  `isRead` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
