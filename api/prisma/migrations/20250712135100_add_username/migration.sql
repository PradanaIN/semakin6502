-- Add username column to User
ALTER TABLE `User`
  ADD COLUMN `username` VARCHAR(191) NOT NULL;

-- Add unique constraint on username
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);
