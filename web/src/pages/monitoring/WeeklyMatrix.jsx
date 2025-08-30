import getProgressColor from "../../utils/progressColor";
import { useAuth } from "../auth/useAuth";
import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export const WeeklyMatrixRow = ({
  user,
  progressColor,
  weekCount,
  currentUser,
}) => {
  const isCurrentUser =
    currentUser &&
    (user.userId === currentUser.id || user.nama === currentUser.nama);

  return (
    <tr
      className={`text-center text-sm transition-colors duration-200 odd:bg-gray-50/60 dark:odd:bg-gray-800/40 ${
        isCurrentUser
          ? "bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <td
        className="sticky left-0 bg-white dark:bg-gray-800 z-10 px-4 py-2 text-left font-semibold border border-gray-200 dark:border-gray-600 w-60 md:w-72 whitespace-nowrap overflow-hidden text-ellipsis"
        title={user.nama}
      >
        {user.nama}
      </td>
      {user.weeks.slice(0, weekCount).map((w, i) => (
        <td
          key={i}
          className="p-2 border border-gray-200 dark:border-gray-600 space-y-1"
        >
          <span
            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              w.persen >= 80
                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                : w.persen >= 50
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
            }`}
          >
            {w.persen}%
          </span>
          <div
            role="progressbar"
            aria-valuenow={w.persen}
            aria-valuemin="0"
            aria-valuemax="100"
            className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2 overflow-hidden"
          >
            <div
              className={`${progressColor(
                w.persen
              )} h-2 transition-all duration-300`}
              style={{ width: `${w.persen}%` }}
            />
          </div>
        </td>
      ))}
    </tr>
  );
};

const WeeklyMatrix = ({
  data = [],
  weeks = [],
  onSelectWeek,
  selectedWeek,
}) => {
  const { user: currentUser } = useAuth();
  // Default: do NOT auto-sort by highest progress.
  // Start with alphabetical by name (asc) for clarity and stability.
  const [sortKey, setSortKey] = useState("name"); // 'name' | 'week'
  const [sortWeek, setSortWeek] = useState(0);
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'
  const progressColor = getProgressColor;

  // keep sortWeek in sync with selectedWeek for first render
  const effectiveWeek = sortKey === "week" ? (weeks[selectedWeek] ? selectedWeek : sortWeek) : sortWeek;
  if (sortKey === "week" && effectiveWeek !== sortWeek) {
    // sync without causing infinite loop on next render
  }

  const sortedData = useMemo(() => {
    const arr = Array.isArray(data) ? [...data] : [];
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name") {
      return arr.sort((a, b) => dir * (a?.nama || "").localeCompare(b?.nama || "", "id", { sensitivity: "base" }));
    }
    const wi = weeks[selectedWeek] ? selectedWeek : sortWeek;
    const value = (u) => {
      const weeksArr = Array.isArray(u?.weeks) ? u.weeks : [];
      const w = weeksArr[wi];
      if (w && typeof w.persen === "number") return w.persen;
      const sum = weeksArr.reduce((s, x) => s + (Number(x?.persen) || 0), 0);
      const count = weeksArr.length || 1;
      return Math.round(sum / count);
    };
    return arr.sort((a, b) => dir * (value(a) - value(b)));
  }, [data, sortKey, sortDir, weeks, selectedWeek, sortWeek]);

  const toggleNameSort = () => {
    if (sortKey === "name") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey("name");
      setSortDir("asc");
    }
  };

  const toggleWeekSort = (i) => {
    if (onSelectWeek) onSelectWeek(i);
    if (sortKey === "week" && sortWeek === i) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey("week");
      setSortWeek(i);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ active }) => {
    if (!active) return <ArrowUpDown className="inline-block w-3.5 h-3.5 opacity-40 align-middle" />;
    return sortDir === "asc" ? (
      <ArrowUp className="inline-block w-3.5 h-3.5 align-middle" />
    ) : (
      <ArrowDown className="inline-block w-3.5 h-3.5 align-middle" />
    );
  };

  return (
    <div
      className="overflow-x-auto w-full rounded-md shadow border border-gray-200 dark:border-gray-700 max-h-[65vh]"
    >
      <table className="min-w-[1000px] w-full table-fixed text-sm border-collapse">
        <thead className="sticky top-0 bg-white dark:bg-gray-900 z-20 border-b border-gray-300 dark:border-gray-700">
          <tr>
            <th
              className="sticky left-0 z-30 bg-white dark:bg-gray-900 p-2 text-left font-bold border-l border-r border-gray-300 dark:border-gray-700 w-48 md:w-60 select-none cursor-pointer"
              onClick={toggleNameSort}
              title="Urutkan berdasarkan Nama"
            >
              <span className="inline-flex items-center gap-1">
                Nama <SortIcon active={sortKey === "name"} />
              </span>
            </th>
            {weeks.map((_, i) => (
              <th
                key={i}
                onClick={() => toggleWeekSort(i)}
                className={`p-2 border-r border-gray-300 dark:border-gray-700 text-center font-medium cursor-pointer select-none transition-colors duration-200 ${
                  selectedWeek === i
                    ? "bg-blue-200 dark:bg-blue-600 text-blue-900 dark:text-blue-100"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="inline-flex items-center justify-center gap-1">
                  Minggu {i + 1} <SortIcon active={sortKey === "week" && (sortWeek === i || selectedWeek === i)} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={weeks.length + 1}
                className="p-4 text-center text-gray-500"
              >
                Belum ada data
              </td>
            </tr>
          ) : (
            sortedData.map((u) => (
              <WeeklyMatrixRow
                key={u.userId}
                user={u}
                progressColor={progressColor}
                weekCount={weeks.length}
                currentUser={currentUser}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyMatrix;
