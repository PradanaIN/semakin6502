import { getHolidays } from "../../utils/holidays";
import { useAuth } from "../auth/useAuth";

export const DailyMatrixRow = ({ user, boxClass, currentUser }) => {
  const isCurrentUser =
    currentUser && (user.userId === currentUser.id || user.nama === currentUser.nama);
  return (
    <tr
      className={`text-center transition-colors ${
        isCurrentUser ? "bg-yellow-50 dark:bg-yellow-900" : "hover:bg-gray-50 dark:hover:bg-gray-700"
      }`}
    >
      <td className="px-4 py-2 border text-left text-sm whitespace-nowrap font-medium">
        {user.nama}
        {isCurrentUser && <span className="ml-1 text-xs">🟢 Kamu</span>}
      </td>
      {user.detail.map((day, i) => (
        <td
          key={i}
          title={day.count ? `${day.count} laporan` : ""}
          className={`px-2 py-1 border text-sm ${boxClass(day)}`}
        >
          {day.count || ""}
        </td>
      ))}
    </tr>
  );
};

const DailyMatrix = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  const { user: currentUser } = useAuth();

  const year = new Date(data[0].detail[0].tanggal).getFullYear();
  const today = new Date().toISOString().slice(0, 10);
  const HOLIDAYS = getHolidays(year);

  const isWeekend = (iso) => {
    const d = new Date(iso);
    return d.getDay() === 0 || d.getDay() === 6;
  };

  const isHoliday = (iso) => HOLIDAYS.includes(iso);

  const boxClass = (day) => {
    if (day.count > 0)
      return "bg-green-200 border-green-500 dark:bg-green-700 dark:border-green-400";
    if (isWeekend(day.tanggal) || isHoliday(day.tanggal))
      return "bg-blue-100 border-blue-300 dark:bg-blue-700 dark:border-blue-500";
    if (day.tanggal < today)
      return "bg-yellow-100 border-yellow-400 dark:bg-yellow-700 dark:border-yellow-500";
    return "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600";
  };

  const dayCount = data[0].detail.length;

  return (
    <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
      <table className="min-w-full border text-sm rounded shadow">
        <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-2 border text-left">Nama</th>
            {Array.from({ length: dayCount }, (_, i) => (
              <th key={i} className="px-2 py-1 border text-center">
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <DailyMatrixRow
              key={u.userId}
              user={u}
              boxClass={boxClass}
              currentUser={currentUser}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DailyMatrix;
