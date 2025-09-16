export function getWeekStarts(monthIndex, year) {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const starts = [];

  const start = new Date(first);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  for (let d = new Date(start); d <= last; d.setDate(d.getDate() + 7)) {
    starts.push(new Date(d));
  }

  return starts;
}

export function getCurrentWeekIndex(weekStarts) {
  const today = new Date();
  return weekStarts.findIndex((start) => {
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return today >= start && today < end;
  });
}
