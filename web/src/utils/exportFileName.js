import months from "./months";

/**
 * @param {string} title - Judul file seperti "LaporanHarian"
 * @param {number} monthIndex - Bulan (1-12)
 * @param {number} [minggu] - Opsional, minggu ke-berapa
 * @returns {string} - Nama file lengkap dengan timestamp, judul, bulan, dan minggu jika ada
 */
export default function exportFileName(title, monthIndex, minggu) {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  const idx =
    typeof monthIndex === "number" && monthIndex >= 1 && monthIndex <= 12
      ? monthIndex - 1
      : now.getMonth();
  const monthName = months[idx];

  const mingguPart = minggu ? `_Minggu_${minggu}` : "";

  return `${dd}${mm}${yyyy}_${hh}${min}_${title}_${monthName}${mingguPart}`;
}
