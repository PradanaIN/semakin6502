-- Add creatorId column to Penugasan
ALTER TABLE `Penugasan`
  ADD COLUMN `creatorId` INTEGER;

-- Populate creatorId for existing rows
UPDATE `Penugasan` SET `creatorId` = `pegawaiId` WHERE `creatorId` IS NULL;

-- Make column required
ALTER TABLE `Penugasan`
  MODIFY `creatorId` INTEGER NOT NULL;

-- Add foreign key constraint
ALTER TABLE `Penugasan`
  ADD CONSTRAINT `Penugasan_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
