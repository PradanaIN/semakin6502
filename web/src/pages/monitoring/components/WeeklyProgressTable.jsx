import getProgressColor from "../../../utils/progressColor";
import { useAuth } from "../../auth/useAuth";
import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

const WeeklyProgressTable = ({ data = [] }) => {
  const { user: currentUser } = useAuth();
  const progressColor = getProgressColor;

  const [sortKey, setSortKey] = useState("nama"); // nama|selesai|total|persen
  const [sortDir, setSortDir] = useState("asc"); // asc|desc

  const sorted = useMemo(() => {
    const arr = Array.isArray(data) ? [...data] : [];
    const cmp = (a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "nama") {
        return dir * (a?.nama || "").localeCompare(b?.nama || "", "id", { sensitivity: "base" });
      }
      const va = Number(a?.[sortKey]) || 0;
      const vb = Number(b?.[sortKey]) || 0;
      return dir * (va - vb);
    };
    return arr.sort(cmp);
  }, [data, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "nama" ? "asc" : "desc");
    }
  };

  const SortIcon = ({ active, dir }) => {
    if (!active) return <ArrowUpDown className="inline-block w-3.5 h-3.5 opacity-40 align-middle" />;
    return dir === "asc" ? (
      <ArrowUp className="inline-block w-3.5 h-3.5 align-middle" />
    ) : (
      <ArrowDown className="inline-block w-3.5 h-3.5 align-middle" />
    );
  };

  return (
    <div className="overflow-x-auto w-full mt-4 rounded-md border border-gray-200 dark:border-gray-700 shadow bg-white dark:bg-gray-900 max-h-[65vh]">
      <table className="min-w-[900px] w-full table-fixed text-sm border-collapse">
        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-20 border-b border-gray-300 dark:border-gray-700">
          <tr>
            <th
              className="sticky left-0 z-30 bg-white dark:bg-gray-900 p-2 text-left font-bold border-l border-r border-gray-300 dark:border-gray-700 w-48 md:w-60 select-none cursor-pointer"
              onClick={() => toggleSort("nama")}
              title="Urutkan berdasarkan Nama"
            >
              <span className="inline-flex items-center gap-1">
                Nama <SortIcon active={sortKey === "nama"} dir={sortDir} />
              </span>
            </th>
            <th
              className="px-2 py-2 border-r text-center font-semibold w-24 select-none cursor-pointer"
              onClick={() => toggleSort("selesai")}
              title="Urutkan berdasarkan Tugas Selesai"
            >
              <span className="inline-flex items-center justify-center gap-1">
                Tugas Selesai <SortIcon active={sortKey === "selesai"} dir={sortDir} />
              </span>
            </th>
            <th
              className="px-2 py-2 border-r text-center font-semibold w-24 select-none cursor-pointer"
              onClick={() => toggleSort("total")}
              title="Urutkan berdasarkan Total Tugas"
            >
              <span className="inline-flex items-center justify-center gap-1">
                Total Tugas <SortIcon active={sortKey === "total"} dir={sortDir} />
              </span>
            </th>
            <th
              className="px-2 py-2 border-r text-center font-semibold w-40 select-none cursor-pointer"
              onClick={() => toggleSort("persen")}
              title="Urutkan berdasarkan Capaian"
            >
              <span className="inline-flex items-center justify-center gap-1">
                Capaian <SortIcon active={sortKey === "persen"} dir={sortDir} />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                Belum ada data
              </td>
            </tr>
          ) : (
            sorted.map((u) => {
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
                    className="sticky left-0 bg-white dark:bg-gray-800 z-10 px-4 py-2 text-left font-semibold border-l border-r border-gray-300 dark:border-gray-700 w-60 md:w-72 whitespace-nowrap overflow-hidden text-ellipsis"
                    title={u.nama}
                  >
                    {u.nama}
                  </td>
                  <td className="px-2 py-2 border-r text-center tabular-nums w-24">
                    {u.selesai}
                  </td>
                  <td className="px-2 py-2 border-r text-center tabular-nums w-24">
                    {u.total}
                  </td>
                  <td className="px-2 py-2 border-r space-y-1 w-40">
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full text-center ${
                        u.persen >= 80
                          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                          : u.persen >= 50
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                      }`}
                    >
                      {u.persen}%
                    </span>
                    <div
                      role="progressbar"
                      aria-valuenow={u.persen}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      className="w-28 mx-auto bg-gray-200 dark:bg-gray-700 rounded h-2 overflow-hidden"
                    >
                      <div
                        className={`${progressColor(
                          u.persen
                        )} h-2 transition-all duration-300`}
                        style={{ width: `${u.persen}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyProgressTable;
