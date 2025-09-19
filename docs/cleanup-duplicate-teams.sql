-- Detect duplicate team names ignoring case before applying the unique constraint
SELECT LOWER(nama_tim) AS normalized_name,
       COUNT(*) AS duplicate_count,
       GROUP_CONCAT(id ORDER BY id) AS team_ids
FROM Team
GROUP BY LOWER(nama_tim)
HAVING COUNT(*) > 1;

-- Remove duplicated teams while keeping the lowest ULID for each normalized name
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY LOWER(nama_tim) ORDER BY id) AS rn
  FROM Team
)
DELETE FROM Team
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
