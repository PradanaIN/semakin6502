import months from './months';

export function exportFileName(title: string, monthIndex?: number): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const idx =
    typeof monthIndex === 'number' && monthIndex >= 1 && monthIndex <= 12
      ? monthIndex - 1
      : now.getMonth();
  const monthName = months[idx];
  return `${dd}${mm}${yyyy}_${hh}${min}_${title}_${monthName}`;
}

export default exportFileName;
