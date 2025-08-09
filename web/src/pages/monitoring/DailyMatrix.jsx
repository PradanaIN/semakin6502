import { getHolidays } from "../../utils/holidays";
import { useAuth } from "../auth/useAuth";
import dayjs from "../../utils/dayjs";

export const DailyMatrixRow = ({ user, boxClass, currentUser }) => {
  const isCurrentUser =
    currentUser &&
    (user.userId === currentUser.id || user.nama === currentUser.nama);

  return (
    <tr
      className={`text-center transition-colors duration-200 border-b border-gray-200 dark:border-gray-700 ${
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
      {user.detail.map((day) => (
        <td
          key={day.tanggal}
          title={day.count ? `${day.count} laporan` : ""}
          className={`px-4 py-2 border border-gray-300 dark:border-gray-600 text-center ${boxClass(
            day
          )} truncate`}
        >
          {day.count || ""}
        </td>
      ))}
    </tr>
  );
};

const DailyMatrix = ({ data = [], monthIndex, year }) => {
  const { user: currentUser } = useAuth();

  const rows = Array.isArray(data) ? data : [];

  const today = dayjs().tz("Asia/Makassar");
  const HOLIDAYS = getHolidays(year);

  const isWeekend = (iso) => {
    const d = dayjs.utc(iso).tz("Asia/Makassar");
    return d.day() === 0 || d.day() === 6;
  };

  const isHoliday = (iso) =>
    HOLIDAYS.includes(
      dayjs.utc(iso).tz("Asia/Makassar").format("YYYY-MM-DD")
    );

  const boxClass = (day) => {
    if (day.count > 0)
      return "bg-green-100 dark:bg-green-700 text-green-900 dark:text-green-100";
    if (isWeekend(day.tanggal) || isHoliday(day.tanggal))
      return "bg-blue-100 dark:bg-blue-700 text-blue-900 dark:text-blue-100";
    if (dayjs.utc(day.tanggal).tz("Asia/Makassar").isBefore(today, "day"))
      return "bg-yellow-100 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100";
    return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
  };

  const dayCount = dayjs().year(year).month(monthIndex).daysInMonth();

  return (
    <div className="overflow-x-auto max-h-[65vh] overflow-y-auto w-full rounded-md shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <table className="min-w-[1000px] w-full table-fixed text-sm">
        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-20 border-b border-gray-300 dark:border-gray-700">
          <tr>
            <th className="sticky left-0 z-30 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-left font-bold border-r border-gray-300 dark:border-gray-700 w-48 md:w-60">
              Nama
            </th>
            {Array.from({ length: dayCount }, (_, i) => (
              <th
                key={i}
                className="px-4 py-2 border-r border-gray-300 dark:border-gray-700 text-center font-medium"
              >
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((u) => (
              <DailyMatrixRow
                key={u.userId}
                user={u}
                boxClass={boxClass}
                currentUser={currentUser}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={dayCount + 1}
                className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
              >
                Belum ada laporan
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DailyMatrix;
