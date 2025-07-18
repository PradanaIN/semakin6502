import { getHolidays } from "../../utils/holidays";
import Legend from "../ui/Legend";

const DailyOverview = ({ data = [] }) => {
  if (!Array.isArray(data))
    return <p>✊🙏✊✊🙏✊🙏 Data tidak tersedia 🫰🫰🤟🤟☝☝</p>;

  const today = new Date().toISOString().slice(0, 10);
  const currentYear = new Date(today).getFullYear();

  const formatDate = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  const HOLIDAYS = getHolidays(currentYear);

  const isWeekend = (iso) => {
    const d = new Date(iso);
    const g = d.getDay();
    return g === 0 || g === 6;
  };

  const isHoliday = (iso) => HOLIDAYS.includes(iso);

  const boxClass = (day) => {
    if (day.adaKegiatan) {
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
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">
        Kalender Aktivitas Harian
      </h2>
      <Legend className="mb-2" />
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {data.map((day) => {
          const dayName = new Date(day.tanggal).toLocaleDateString("id-ID", {
            weekday: "short",
          });
          const weekend = isWeekend(day.tanggal) || isHoliday(day.tanggal);
          return (
            <div
              key={day.tanggal}
              className={`p-3 rounded-lg text-center text-sm font-medium border ${boxClass(
                day
              )}`}
            >
              <div className="text-gray-800 dark:text-gray-100">
                {dayName}, {formatDate(day.tanggal)}
              </div>
              {weekend && (
                <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  {isHoliday(day.tanggal) ? "Hari Libur" : "Akhir Pekan"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyOverview;
