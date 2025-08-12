import months from "./months";

export default function formatDate(iso = "", separator = " ") {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    // fallback to the raw value when date is invalid
    return iso.slice(0, 10).replace(/-/g, separator);
  }
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}${separator}${months[d.getMonth()]}${separator}${d.getFullYear()}`;
}
