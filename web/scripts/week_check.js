function getWeekOfMonth(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // Monday=0
  return Math.floor((date.getDate() + offset - 1) / 7) + 1;
}

function getDateFromPeriod(minggu, bulan, tahun) {
  const monthIndex = bulan - 1;
  const first = new Date(tahun, monthIndex, 1);
  const offset = (first.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(tahun, monthIndex + 1, 0).getDate();
  const startDay = (minggu - 1) * 7 - offset + 1;
  const day = Math.min(daysInMonth, Math.max(1, startDay));
  const yyyy = tahun;
  const mm = String(bulan).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function weeksInMonth(bulan, tahun) {
  const first = new Date(tahun, bulan - 1, 1);
  const dim = new Date(tahun, bulan, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // Monday=0
  return Math.ceil((dim + offset) / 7);
}

const cases = [
  { y: 2025, m: 2 }, // Feb 2025 starts Sat
  { y: 2025, m: 6 }, // Jun 2025 starts Sun
  { y: 2025, m: 8 }, // Aug 2025
  { y: 2024, m: 9 }, // Sep 2024 (leap year context around)
  { y: 2024, m: 12 }, // Dec 2024
];

for (const c of cases) {
  const weeks = weeksInMonth(c.m, c.y);
  console.log(`\n${c.y}-${String(c.m).padStart(2, "0")} weeks=${weeks}`);
  for (let w = 1; w <= weeks; w++) {
    const dStr = getDateFromPeriod(w, c.m, c.y);
    const d = new Date(`${dStr}T00:00:00`);
    const wom = getWeekOfMonth(d);
    console.log(` w${w}->${dStr}(week=${wom});`);
  }
  console.log();
  // Verify mapping stays within month for all days
  let ok = true;
  for (let day = 1; day <= new Date(c.y, c.m, 0).getDate(); day++) {
    const d = new Date(c.y, c.m - 1, day);
    const w = getWeekOfMonth(d);
    const d2 = new Date(`${getDateFromPeriod(w, c.m, c.y)}T00:00:00`);
    if (d2.getMonth() !== d.getMonth()) {
      ok = false;
      break;
    }
  }
  console.log(` days->week->date stays in month: ${ok}`);
}
/* eslint-env node */
