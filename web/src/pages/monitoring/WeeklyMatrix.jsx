import React from "react";

export const WeeklyMatrixRow = ({ user, progressColor }) => (
  <tr className="text-center">
    <td className="p-2 border text-left whitespace-nowrap text-sm">{user.nama}</td>
    {user.weeks.map((w, i) => (
      <td key={i} className="p-1 border space-y-1">
        <div
          role="progressbar"
          aria-valuenow={w.persen}
          aria-valuemin="0"
          aria-valuemax="100"
          className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2"
        >
          <div
            className={`${progressColor(w.persen)} h-2 rounded`}
            style={{ width: `${w.persen}%` }}
          />
        </div>
        <span className="text-xs font-medium">{w.persen}%</span>
      </td>
    ))}
  </tr>
);

const WeeklyMatrix = ({ data = [], weeks = [], onSelectWeek }) => {
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
    <div className="overflow-auto md:overflow-visible">
      <table className="min-w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-2 border text-left">Nama</th>
            {weeks.map((_, i) => (
              <th
                key={i}
                onClick={() => onSelectWeek && onSelectWeek(i)}
                className="p-2 border text-center cursor-pointer"
              >
                Minggu {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <WeeklyMatrixRow key={u.userId} user={u} progressColor={progressColor} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyMatrix;
