-- Widen Notification.text and LaporanHarian.catatan to TEXT
ALTER TABLE `Notification`
  MODIFY `text` TEXT NOT NULL;

ALTER TABLE `LaporanHarian`
  MODIFY `catatan` TEXT NULL;

