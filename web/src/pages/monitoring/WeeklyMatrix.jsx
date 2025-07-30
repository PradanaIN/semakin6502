import React from "react";
import getProgressColor from "../../utils/progressColor";
import { useAuth } from "../auth/useAuth";

export const WeeklyMatrixRow = ({ user, progressColor, weekCount, currentUser }) => {
  const isCurrentUser =
    currentUser && (user.userId === currentUser.id || user.nama === currentUser.nama);
  return (
    <tr
      className={`text-center transition-colors ${
        isCurrentUser ? "bg-yellow-50 dark:bg-yellow-900" : "hover:bg-gray-50 dark:hover:bg-gray-700"
      }`}
    >
      <td className="p-2 border text-left whitespace-nowrap text-sm font-medium">
        {user.nama}
        {isCurrentUser && <span className="ml-1 text-xs">🟢 Kamu</span>}
      </td>
      {user.weeks.slice(0, weekCount).map((w, i) => (
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
};

const WeeklyMatrix = ({ data = [], weeks = [], onSelectWeek, selectedWeek }) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  const { user: currentUser } = useAuth();
  const progressColor = getProgressColor;

  return (
    <div className="overflow-auto md:overflow-visible max-h-[60vh]">
      <table className="min-w-full text-xs border-collapse">
        <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
          <tr>
            <th className="p-2 border text-left">Nama</th>
            {weeks.map((_, i) => (
              <th
                key={i}
                onClick={() => onSelectWeek && onSelectWeek(i)}
                className={`p-2 border text-center cursor-pointer ${
                  selectedWeek === i ? "bg-blue-200 dark:bg-blue-600" : ""
                }`}
              >
                Minggu {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <WeeklyMatrixRow
              key={u.userId}
              user={u}
              progressColor={progressColor}
              weekCount={weeks.length}
              currentUser={currentUser}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyMatrix;
