import React from "react";
import getProgressColor from "../../../utils/progressColor";
import { useAuth } from "../../auth/useAuth";

const WeeklyProgressTable = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  const { user: currentUser } = useAuth();
  const progressColor = getProgressColor;

  return (
    <div className="overflow-x-auto md:overflow-visible mt-4 max-h-[60vh] w-full">
      <table className="min-w-[1000px] w-full table-fixed text-xs border-collapse border rounded-lg shadow">
        <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10 shadow-sm">
          <tr>
            <th className="p-2 border text-left">Nama</th>
            <th className="p-2 border text-center">Tugas Selesai</th>
            <th className="p-2 border text-center">Total Tugas</th>
            <th className="p-2 border text-center">Capaian</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <tr
              key={u.userId}
              className={`text-center transition-colors ${
                currentUser && (u.userId === currentUser.id || u.nama === currentUser.nama)
                  ? "bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <td className="p-2 border text-left whitespace-nowrap text-sm font-medium">
                {u.nama}
              </td>
              <td className="p-1 border">{u.selesai}</td>
              <td className="p-1 border">{u.total}</td>
              <td className="p-1 border space-y-1">
                <div
                  role="progressbar"
                  aria-valuenow={u.persen}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2"
                >
                  <div
                    className={`${progressColor(u.persen)} h-2 rounded`}
                    style={{ width: `${u.persen}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{u.persen}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyProgressTable;
