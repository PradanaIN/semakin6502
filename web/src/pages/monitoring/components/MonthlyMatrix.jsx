import React from "react";
import getProgressColor from "../../../utils/progressColor";
import months from "../../../utils/months";
import { useAuth } from "../../auth/useAuth";

const MonthlyMatrix = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  const { user: currentUser } = useAuth();
  const progressColor = getProgressColor;

  return (
    <div className="overflow-auto md:overflow-visible mt-4 max-h-[60vh]">
      <table className="min-w-full text-xs border-collapse">
        <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
          <tr>
            <th className="p-2 border text-left">Nama</th>
            {months.map((m, i) => (
              <th key={i} className="p-1 border text-center">
                {m.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <tr
              key={u.userId}
              className={`text-center transition-colors ${
                currentUser && (u.userId === currentUser.id || u.nama === currentUser.nama)
                  ? "bg-yellow-50 dark:bg-yellow-900"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <td className="p-2 border text-left whitespace-nowrap text-sm font-medium">
                {u.nama}
                {currentUser && (u.userId === currentUser.id || u.nama === currentUser.nama) && (
                  <span className="ml-1 text-xs">🟢 Kamu</span>
                )}
              </td>
              {u.months.map((m, i) => (
                <td key={i} className="p-1 border space-y-1">
                  <div
                    role="progressbar"
                    aria-valuenow={m.persen}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2"
                  >
                    <div
                      className={`${progressColor(m.persen)} h-2 rounded`}
                      style={{ width: `${m.persen}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{m.persen}%</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyMatrix;
