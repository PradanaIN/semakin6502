-- Add unique constraint on Member userId and teamId
CREATE UNIQUE INDEX `Member_userId_teamId_key` ON `Member`(`userId`, `teamId`);
