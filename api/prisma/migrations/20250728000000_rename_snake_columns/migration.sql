-- Rename legacy snake_case columns to camelCase
ALTER TABLE `Team` CHANGE `nama_tim` `namaTim` VARCHAR(191) NOT NULL;
ALTER TABLE `Member` CHANGE `is_leader` `isLeader` BOOLEAN NOT NULL;
ALTER TABLE `MasterKegiatan` CHANGE `nama_kegiatan` `namaKegiatan` VARCHAR(191) NOT NULL;
ALTER TABLE `LaporanHarian` CHANGE `bukti_link` `buktiLink` VARCHAR(191);
ALTER TABLE `KegiatanTambahan` CHANGE `bukti_link` `buktiLink` VARCHAR(191);
ALTER TABLE `KegiatanTambahan` CHANGE `tanggal_selesai` `tanggalSelesai` DATETIME(3);
ALTER TABLE `KegiatanTambahan` CHANGE `tanggal_selesai_akhir` `tanggalSelesaiAkhir` DATETIME(3);
