import React from "react";

export const MonthlyMatrixRow = ({ user, progressColor, style }) => (
  <tr className="text-center" style={style}>
    <td className="p-2 border text-left whitespace-nowrap text-sm">{user.nama}</td>
    {(user.months || []).map((b, idx) => (
      <td key={idx} className="p-1 border space-y-1">
        <div
          role="progressbar"
          aria-valuenow={b.persen}
          aria-valuemin="0"
          aria-valuemax="100"
          className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2"
        >
          <div
            className={`${progressColor(b.persen)} h-2 rounded`}
            style={{ width: `${b.persen}%` }}
          />
        </div>
        <span className="text-xs font-medium">{b.persen}%</span>
      </td>
    ))}
  </tr>
);
import months from "../../utils/months";

const MonthlyMatrix = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  const colorFor = (p) => {
    if (p >= 80) return "green";
    if (p >= 50) return "yellow";
    return "red";
  };

  const progressColor = (p) => {
    const c = colorFor(p);
    return c === "green"
      ? "bg-green-500"
      : c === "yellow"
      ? "bg-yellow-500"
      : "bg-red-500";
  };

  return (
    <div className="overflow-auto">
      <table className="min-w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-2 border text-left">Nama</th>
            {months.map((m, i) => (
              <th key={i} className="p-2 border text-center whitespace-nowrap">
                {m.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <MonthlyMatrixRow key={u.userId} user={u} progressColor={progressColor} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyMatrix;
