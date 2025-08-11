import React from "react";
import getProgressColor from "../../../utils/progressColor";
import { useAuth } from "../../auth/useAuth";

const WeeklyProgressTable = ({ data = [] }) => {
  const { user: currentUser } = useAuth();
  const rows = Array.isArray(data) ? data : [];
  const progressColor = getProgressColor;

  return (
    <div
      className="overflow-x-auto w-full mt-4 rounded-md border border-gray-200 dark:border-gray-700 shadow bg-white dark:bg-gray-900 max-h-[65vh]"
    >
      <table className="min-w-[1000px] w-full table-fixed text-sm border-collapse">
        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-20 border-b border-gray-300 dark:border-gray-700">
          <tr>
            <th className="sticky left-0 z-30 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-left font-bold border-r border-gray-300 dark:border-gray-700 w-48 md:w-60">
              Nama
            </th>
            <th className="px-4 py-2 border-r text-center font-semibold">
              Tugas Selesai
            </th>
            <th className="px-4 py-2 border-r text-center font-semibold">
              Total Tugas
            </th>
            <th className="px-4 py-2 border-r text-center font-semibold">Capaian</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="p-4 text-center text-gray-500"
              >
                Belum ada data
              </td>
            </tr>
          ) : (
            rows.map((u) => {
              const isCurrentUser =
                currentUser &&
                (u.userId === currentUser.id || u.nama === currentUser.nama);

              return (
                <tr
                  key={u.userId}
                  className={`text-center transition-colors duration-200 border-b border-gray-200 dark:border-gray-700 ${
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
                  <td className="px-4 py-2 border-r">{u.selesai}</td>
                  <td className="px-4 py-2 border-r">{u.total}</td>
                  <td className="px-4 py-2 border-r space-y-1">
                    <div
                      role="progressbar"
                      aria-valuenow={u.persen}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2 overflow-hidden"
                    >
                      <div
                        className={`${progressColor(
                          u.persen
                        )} h-2 transition-all duration-300`}
                        style={{ width: `${u.persen}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-center block">
                      {u.persen}%
                    </span>
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
