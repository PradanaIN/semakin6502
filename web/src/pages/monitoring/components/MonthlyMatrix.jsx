import React from "react";
import getProgressColor from "../../../utils/progressColor";
import months from "../../../utils/months";

const MonthlyMatrix = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  const progressColor = getProgressColor;

  return (
    <div className="overflow-auto md:overflow-visible mt-4">
      <table className="min-w-full text-xs border-collapse">
        <thead>
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
            <tr key={u.userId} className="text-center">
              <td className="p-2 border text-left whitespace-nowrap text-sm">
                {u.nama}
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
