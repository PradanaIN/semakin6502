export function colorFor(p) {
  if (p >= 80) return "green";
  if (p >= 50) return "yellow";
  return "red";
}

export default function getProgressColor(persen) {
  const c = colorFor(persen);
  return c === "green"
    ? "bg-green-500"
    : c === "yellow"
    ? "bg-yellow-500"
    : "bg-red-500";
}
