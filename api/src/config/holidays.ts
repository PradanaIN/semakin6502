// Sumber libur backend disamakan dengan frontend util `web/src/utils/holidays.js`.
// Kita generate untuk tahun (y-1, y, y+1) dan izinkan override via ENV `HOLIDAYS` (comma-separated).

function parseEnvList(name: string): string[] {
  const raw = process.env[name];
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
}

// Mirror logic frontend util
export const getHolidaysByYear = (year: number): string[] => [
  `${year}-01-01`,
  `${year}-02-10`,
  `${year}-03-28`,
  `${year}-03-29`,
  `${year}-05-01`,
  `${year}-05-02`,
  `${year}-08-17`,
  `${year}-12-25`,
  `${year}-12-26`,
];

export function getHolidaySet(): Set<string> {
  const now = new Date();
  const y = now.getFullYear();
  const base = [
    ...getHolidaysByYear(y - 1),
    ...getHolidaysByYear(y),
    ...getHolidaysByYear(y + 1),
  ];
  const env = parseEnvList("HOLIDAYS");
  return new Set([...base, ...env]);
}

export function isHolidayLocal(date: Date, set = getHolidaySet()): boolean {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return set.has(`${y}-${m}-${d}`);
}
