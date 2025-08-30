-- Widen all `deskripsi` columns to TEXT for consistency
ALTER TABLE `MasterKegiatan`
  MODIFY `deskripsi` TEXT NULL;

ALTER TABLE `LaporanHarian`
  MODIFY `deskripsi` TEXT NULL;

ALTER TABLE `KegiatanTambahan`
  MODIFY `deskripsi` TEXT NULL;

