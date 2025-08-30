import { getHolidays } from "../../../utils/holidays";
import Legend from "../../../components/ui/Legend";
import months from "../../../utils/months";

const DailyOverview = ({ data = [] }) => {
  if (!Array.isArray(data)) {
    return <p>Data tidak tersedia</p>;
  }

  const filteredData = data.filter(
    (day) => !isNaN(new Date(day.tanggal))
  );

  // Use local YYYY-MM-DD to avoid timezone shift
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const currentYear = new Date(today).getFullYear();

  const formatDate = (iso) => {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const HOLIDAYS = getHolidays(currentYear);

  const isWeekend = (iso) => {
    const d = new Date(iso);
    const g = d.getDay();
    return g === 0 || g === 6;
  };

  const isHoliday = (iso) => HOLIDAYS.includes(iso);

  const boxClass = (day) => {
    const base = "transition-all duration-200 border-2 shadow-sm";
    if (day.adaKegiatan) {
      return `${base} bg-green-100 border-green-500 dark:bg-green-800 dark:border-green-400`;
    }
    if (isWeekend(day.tanggal) || isHoliday(day.tanggal)) {
      return `${base} bg-blue-100 border-blue-400 dark:bg-blue-800 dark:border-blue-300`;
    }
    // Mark today without activity as warning as well
    if (day.tanggal <= today) {
      return `${base} bg-yellow-100 border-yellow-400 dark:bg-yellow-800 dark:border-yellow-500`;
    }
    return `${base} bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600`;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">
        Kalender Aktivitas Harian
      </h2>
      <Legend className="mb-2" />
      {filteredData.length === 0 && <p>Tidak ada laporan</p>}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {filteredData.map((day) => {
          const dayName = new Date(day.tanggal).toLocaleDateString("id-ID", {
            weekday: "short",
          });
          const weekend = isWeekend(day.tanggal) || isHoliday(day.tanggal);
          return (
            <div
              key={day.tanggal}
              className={`p-3 rounded-xl text-center text-sm font-medium ${boxClass(
                day
              )}`}
            >
              <div className="text-gray-900 dark:text-gray-100 font-semibold">
                {dayName}, {formatDate(day.tanggal)}
              </div>

              {weekend && (
                <div className="text-xs mt-1 font-medium text-blue-600 dark:text-blue-300"></div>
              )}

              {!weekend && !day.adaKegiatan && day.tanggal < today && (
                <div className="text-xs mt-1 font-medium text-yellow-700 dark:text-yellow-300"></div>
              )}

              {day.adaKegiatan && (
                <div className="text-xs mt-1 font-medium text-green-700 dark:text-green-200"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyOverview;
