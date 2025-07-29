import months from "./months";

export default function formatDate(iso = "") {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    // fallback to the raw value when date is invalid
    return iso.slice(0, 10);
  }
  const day = String(d.getDate()).padStart(2, "0");
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
