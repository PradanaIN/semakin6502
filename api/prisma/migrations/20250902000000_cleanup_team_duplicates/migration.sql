-- Consolidate duplicate teams before enforcing a unique constraint on namaTim

-- Remove duplicate Member rows that would conflict once teamIds are merged
DELETE m1
FROM `Member` m1
JOIN `Member` m2
  ON m1.`userId` = m2.`userId`
 AND m1.`id` > m2.`id`
JOIN `Team` t1 ON m1.`teamId` = t1.`id`
JOIN `Team` t2 ON m2.`teamId` = t2.`id`
WHERE t1.`namaTim` = t2.`namaTim`;

-- Build a mapping of each team name to the smallest team id that should be kept
CREATE TEMPORARY TABLE `tmp_team_canonical` (
  `namaTim` VARCHAR(191) NOT NULL,
  `keep_id` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`namaTim`)
) ENGINE=InnoDB;

INSERT INTO `tmp_team_canonical` (`namaTim`, `keep_id`)
SELECT `namaTim`, MIN(`id`)
FROM `Team`
GROUP BY `namaTim`;

-- Update foreign keys to point at the canonical team id
UPDATE `Member` m
JOIN `Team` t ON m.`teamId` = t.`id`
JOIN `tmp_team_canonical` map ON t.`namaTim` = map.`namaTim`
SET m.`teamId` = map.`keep_id`
WHERE m.`teamId` <> map.`keep_id`;

UPDATE `MasterKegiatan` mk
JOIN `Team` t ON mk.`teamId` = t.`id`
JOIN `tmp_team_canonical` map ON t.`namaTim` = map.`namaTim`
SET mk.`teamId` = map.`keep_id`
WHERE mk.`teamId` <> map.`keep_id`;

UPDATE `KegiatanTambahan` kt
JOIN `Team` t ON kt.`teamId` = t.`id`
JOIN `tmp_team_canonical` map ON t.`namaTim` = map.`namaTim`
SET kt.`teamId` = map.`keep_id`
WHERE kt.`teamId` <> map.`keep_id`;

-- Drop duplicate team rows, keeping the smallest id per team name
DELETE t1
FROM `Team` t1
JOIN `Team` t2
  ON t1.`namaTim` = t2.`namaTim`
 AND t1.`id` > t2.`id`;

DROP TEMPORARY TABLE `tmp_team_canonical`;

-- Ensure the column uses a case-insensitive collation before adding the index
ALTER TABLE `Team`
  MODIFY `namaTim` VARCHAR(191) NOT NULL COLLATE utf8mb4_unicode_ci;

-- Re-create the unique index if it failed previously
SET @index_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Team'
    AND INDEX_NAME = 'Team_namaTim_key'
);

SET @create_index_sql := IF(
  @index_exists = 0,
  'CREATE UNIQUE INDEX `Team_namaTim_key` ON `Team`(`namaTim`);',
  'SELECT 1'
);

PREPARE stmt FROM @create_index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
