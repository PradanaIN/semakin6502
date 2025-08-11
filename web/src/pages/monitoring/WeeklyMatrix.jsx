import React from "react";
import getProgressColor from "../../utils/progressColor";
import { useAuth } from "../auth/useAuth";

export const WeeklyMatrixRow = ({
  user,
  progressColor,
  weekCount,
  currentUser,
}) => {
  const isCurrentUser =
    currentUser &&
    (user.userId === currentUser.id || user.nama === currentUser.nama);

  return (
    <tr
      className={`text-center text-sm transition-colors duration-200 ${
        isCurrentUser
          ? "bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <td
        className="sticky left-0 bg-white dark:bg-gray-800 z-10 px-4 py-2 text-left font-semibold border-r border-gray-300 dark:border-gray-700 w-60 md:w-72 whitespace-nowrap overflow-hidden text-ellipsis"
        title={user.nama}
      >
        {user.nama}
      </td>
      {user.weeks.slice(0, weekCount).map((w, i) => (
        <td
          key={i}
          className="p-2 border border-gray-200 dark:border-gray-600 space-y-1"
        >
          <div
            role="progressbar"
            aria-valuenow={w.persen}
            aria-valuemin="0"
            aria-valuemax="100"
            className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2 overflow-hidden"
          >
            <div
              className={`${progressColor(
                w.persen
              )} h-2 transition-all duration-300`}
              style={{ width: `${w.persen}%` }}
            />
          </div>
          <span className="text-xs font-medium block text-center">
            {w.persen}%
          </span>
        </td>
      ))}
    </tr>
  );
};

const WeeklyMatrix = ({
  data = [],
  weeks = [],
  onSelectWeek,
  selectedWeek,
}) => {
  const { user: currentUser } = useAuth();
  const safeData = Array.isArray(data) ? data : [];
  const progressColor = getProgressColor;

  return (
    <div
      className="overflow-x-auto w-full rounded-md shadow border border-gray-200 dark:border-gray-700 max-h-[65vh]"
    >
      <table className="min-w-[1000px] w-full table-fixed text-sm border-collapse">
        <thead className="sticky top-0 bg-white dark:bg-gray-900 z-20 border-b border-gray-300 dark:border-gray-700">
          <tr>
            <th className="sticky left-0 z-30 bg-white dark:bg-gray-900 p-2 text-left font-bold border-r border-gray-300 dark:border-gray-700 w-48 md:w-60">
              Nama
            </th>
            {weeks.map((_, i) => (
              <th
                key={i}
                onClick={() => onSelectWeek && onSelectWeek(i)}
                className={`p-2 border-r border-gray-300 dark:border-gray-700 text-center font-medium cursor-pointer select-none transition-colors duration-200 ${
                  selectedWeek === i
                    ? "bg-blue-200 dark:bg-blue-600 text-blue-900 dark:text-blue-100"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Minggu {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeData.length === 0 ? (
            <tr>
              <td
                colSpan={weeks.length + 1}
                className="p-4 text-center text-gray-500"
              >
                Belum ada data
              </td>
            </tr>
          ) : (
            safeData.map((u) => (
              <WeeklyMatrixRow
                key={u.userId}
                user={u}
                progressColor={progressColor}
                weekCount={weeks.length}
                currentUser={currentUser}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyMatrix;
