import getProgressColor from "../../../utils/progressColor";
import months from "../../../utils/months";
import { useAuth } from "../../auth/useAuth";
import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

const MonthlyMatrix = ({ data = [] }) => {
  const { user: currentUser } = useAuth();
  // Jangan melakukan early return sebelum semua hooks dieksekusi
  const hasData = Array.isArray(data) && data.length > 0;

  const progressColor = getProgressColor;
  // Sorting state: key can be 'name' or month index (0..11)
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const sortedData = useMemo(() => {
    const arr = [...data];
    const dir = sortDir === "asc" ? 1 : -1;
    const cmp = (a, b) => {
      if (sortKey === "name")
        return dir * (a?.nama || "").localeCompare(b?.nama || "", "id", { sensitivity: "base" });
      const i = Number(sortKey);
      const va = Number(a?.months?.[i]?.persen) || 0;
      const vb = Number(b?.months?.[i]?.persen) || 0;
      return dir * (va - vb);
    };
    return arr.sort(cmp);
  }, [data, sortKey, sortDir]);
  // Compute average per month across all users for a footer row
  const monthCount = months.length;
  const averages = Array.from({ length: monthCount }, (_, i) => {
    const vals = data
      .map((u) => Number(u?.months?.[i]?.persen || 0))
      .filter((n) => Number.isFinite(n));
    if (!vals.length) return 0;
    const sum = vals.reduce((s, v) => s + v, 0);
    return Math.round(sum / vals.length);
  });
  const currentMonthIndex = new Date().getMonth();

  const SortIcon = ({ active, dir }) => {
    if (!active) return <ArrowUpDown className="inline-block w-3.5 h-3.5 opacity-40 align-middle" />;
    return dir === "asc" ? (
      <ArrowUp className="inline-block w-3.5 h-3.5 align-middle" />
    ) : (
      <ArrowDown className="inline-block w-3.5 h-3.5 align-middle" />
    );
  };

  if (!hasData) return null;

  return (
    <div className="overflow-x-auto w-full mt-4 rounded-md border border-gray-200 dark:border-gray-700 shadow bg-white dark:bg-gray-900 max-h-[65vh]">
      <table className="min-w-[1000px] w-full table-fixed text-sm border-collapse">
        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-20 border-b border-gray-300 dark:border-gray-700">
          <tr>
            <th
              className="sticky left-0 z-30 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-left font-bold border-r border-gray-300 dark:border-gray-700 w-48 md:w-60 select-none cursor-pointer"
              onClick={() => toggleSort("name")}
              title="Urutkan berdasarkan Nama"
            >
              <span className="inline-flex items-center gap-1">
                Nama <SortIcon active={sortKey === "name"} dir={sortDir} />
              </span>
            </th>
            {months.map((m, i) => (
              <th
                key={i}
                title={`Urutkan berdasarkan ${m}`}
                onClick={() => toggleSort(i)}
                className={`px-4 py-2 text-center font-semibold border-r border-gray-300 dark:border-gray-700 select-none cursor-pointer ${
                  i === currentMonthIndex ? "bg-blue-100 dark:bg-blue-800" : ""
                }`}
              >
                <span className="inline-flex items-center justify-center gap-1">
                  {m.slice(0, 3)} <SortIcon active={sortKey === i} dir={sortDir} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((u) => {
            const isCurrentUser =
              currentUser &&
              (u.userId === currentUser.id || u.nama === currentUser.nama);

            return (
              <tr
                key={u.userId}
                className={`text-center transition-colors duration-200 border-b border-gray-200 dark:border-gray-700 odd:bg-gray-50/60 dark:odd:bg-gray-800/40 ${
                  isCurrentUser
                    ? "bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <td
                  className="sticky left-0 bg-white dark:bg-gray-800 z-10 px-4 py-2 text-left font-semibold border-r border-gray-300 dark:border-gray-700 w-60 md:w-72 whitespace-nowrap overflow-hidden text-ellipsis"
                  title={u.nama}
                >
                  {u.nama}
                </td>
                {u.months.map((m, i) => (
                  <td
                    key={i}
                    className={`px-4 py-2 border-r border-gray-200 dark:border-gray-600 space-y-1 ${
                      i === currentMonthIndex
                        ? "bg-blue-50 dark:bg-blue-900/40"
                        : ""
                    }`}
                    title={`${months[i]}: ${m.persen}% capaian`}
                  >
                    <div className="text-center">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          m.persen >= 80
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                            : m.persen >= 50
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                        }`}
                      >
                        {m.persen}%
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={m.persen}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2 overflow-hidden"
                    >
                      <div
                        className={`${progressColor(
                          m.persen
                        )} h-2 transition-all duration-300`}
                        style={{ width: `${m.persen}%` }}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700">
            <td className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-left font-bold border-r border-gray-300 dark:border-gray-700 w-60 md:w-72">
              Rata-rata
            </td>
            {averages.map((p, i) => (
              <td
                key={i}
                className="px-4 py-2 border-r border-gray-200 dark:border-gray-600 space-y-1"
              >
                <span className="text-xs font-medium block text-center">
                  {p}%
                </span>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2 overflow-hidden">
                  <div
                    className={`${progressColor(
                      p
                    )} h-2 transition-all duration-300`}
                    style={{ width: `${p}%` }}
                  />
                </div>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default MonthlyMatrix;
