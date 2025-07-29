import React from "react";
import getProgressColor from "../../../utils/progressColor";

const WeeklyProgressTable = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  const progressColor = getProgressColor;

  return (
    <div className="overflow-auto md:overflow-visible mt-4">
      <table className="min-w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-2 border text-left">Nama</th>
            <th className="p-2 border text-center">Selesai</th>
            <th className="p-2 border text-center">Total</th>
            <th className="p-2 border text-center">Progress</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <tr key={u.userId} className="text-center">
              <td className="p-2 border text-left whitespace-nowrap text-sm">
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
