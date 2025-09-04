"use strict";
// Sumber libur backend disamakan dengan frontend util `web/src/utils/holidays.js`.
// Kita generate untuk tahun (y-1, y, y+1) dan izinkan override via ENV `HOLIDAYS` (comma-separated).
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHolidaysByYear = void 0;
exports.getHolidaySet = getHolidaySet;
exports.isHolidayLocal = isHolidayLocal;
function parseEnvList(name) {
    const raw = process.env[name];
    if (!raw)
        return [];
    return raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
}
// Mirror logic frontend util
const getHolidaysByYear = (year) => [
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
exports.getHolidaysByYear = getHolidaysByYear;
function getHolidaySet() {
    const now = new Date();
    const y = now.getFullYear();
    const base = [
        ...(0, exports.getHolidaysByYear)(y - 1),
        ...(0, exports.getHolidaysByYear)(y),
        ...(0, exports.getHolidaysByYear)(y + 1),
    ];
    const env = parseEnvList("HOLIDAYS");
    return new Set([...base, ...env]);
}
function isHolidayLocal(date, set = getHolidaySet()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return set.has(`${y}-${m}-${d}`);
}
