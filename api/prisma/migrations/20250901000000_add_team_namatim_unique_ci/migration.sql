-- Ensure namaTim uses a case-insensitive collation and add a unique constraint
ALTER TABLE `Team`
  MODIFY `namaTim` VARCHAR(191) NOT NULL COLLATE utf8mb4_unicode_ci;
