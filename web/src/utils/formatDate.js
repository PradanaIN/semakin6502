import months from "./months";

export default function formatDate(iso = "") {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    // fallback ke raw value saat date invalid
    return iso.slice(0, 10).replace(/-/g, " ");
  }
  const day = String(d.getDate()).padStart(2, "0");
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
