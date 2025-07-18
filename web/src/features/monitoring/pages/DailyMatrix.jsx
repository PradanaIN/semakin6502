import { getHolidays } from "../../../utils/holidays";

export const DailyMatrixRow = ({ user, boxClass, style }) => (
  <tr className="text-center" style={style}>
    <td className="p-2 border text-left whitespace-nowrap text-sm">{user.nama}</td>
    {user.detail.map((day, i) => (
      <td key={i} className={`p-1 border ${boxClass(day)}`}>{day.count || ""}</td>
    ))}
  </tr>
);

const DailyMatrix = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  const year = new Date(data[0].detail[0].tanggal).getFullYear();
  const today = new Date().toISOString().slice(0, 10);
  const HOLIDAYS = getHolidays(year);

  const isWeekend = (iso) => {
    const d = new Date(iso);
    const g = d.getDay();
    return g === 0 || g === 6;
  };

  const isHoliday = (iso) => HOLIDAYS.includes(iso);

  const boxClass = (day) => {
    if (day.count > 0) {
      return "bg-green-200 border-green-400 dark:bg-green-700 dark:border-green-500";
    }
    if (isWeekend(day.tanggal) || isHoliday(day.tanggal)) {
      return "bg-blue-200 border-blue-400 dark:bg-blue-700 dark:border-blue-500";
    }
    if (day.tanggal < today) {
      return "bg-yellow-200 border-yellow-400 dark:bg-yellow-700 dark:border-yellow-500";
    }
    return "bg-gray-100 dark:bg-gray-700";
  };

  const dayCount = data[0].detail.length;

  return (
    <div className="overflow-auto md:overflow-visible">
      <table className="min-w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-2 border text-left">Nama</th>
            {Array.from({ length: dayCount }, (_, i) => (
              <th key={i} className="p-1 border text-center">
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <DailyMatrixRow key={u.userId} user={u} boxClass={boxClass} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DailyMatrix;
