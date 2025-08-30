import months from "../../../utils/months";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getWeekOfMonth } from "../../../utils/dateUtils";

const MonthlyOverview = ({ data = [], year = new Date().getFullYear() }) => {
  const currentMonthIndex = new Date().getMonth();
  const currentMonthName = months[currentMonthIndex];
  const navigate = useNavigate();

  const handleClick = (i) => {
    const today = new Date();
    const isCurrent = year === today.getFullYear() && i === today.getMonth();
    const week = isCurrent ? getWeekOfMonth(today) : 1;
    navigate(`/monitoring?tab=mingguan&year=${year}&month=${i + 1}&week=${week}`);
  };
  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
        Capaian Kinerja Bulanan
      </h2>

      {/* Grid of Month Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {data.map((item, i) => {
          const progressColor =
            item.persen >= 85
              ? "text-green-600 dark:text-green-400"
              : item.persen >= 60
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-red-600 dark:text-red-400";

          const isCurrent = String(item.bulan).toLowerCase() === String(currentMonthName).toLowerCase();
          const prev = i > 0 ? Number(data[i - 1]?.persen || 0) : null;
          const cur = Number(item.persen || 0);
          const delta = prev === null ? null : cur - prev;
          const DeltaIcon = delta == null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
          const deltaColor =
            delta == null
              ? "text-gray-500 dark:text-gray-400"
              : delta > 0
              ? "text-green-600 dark:text-green-400"
              : delta < 0
              ? "text-red-600 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400";

          return (
            <div
              key={item.bulan}
              className={`p-4 rounded-xl shadow transition hover:shadow-md border ${
                isCurrent
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              }`}
              title={`${item.bulan}: ${cur}% capaian`}
              role="button"
              tabIndex={0}
              onClick={() => handleClick(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleClick(i);
              }}
              >
              <div className="flex items-center justify-between mb-2">
                <div className="text-base font-semibold text-gray-800 dark:text-gray-100">
                  {item.bulan}
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${deltaColor}`}>
                  <DeltaIcon className="w-3.5 h-3.5" />
                  {delta == null ? "—" : `${delta > 0 ? "+" : ""}${delta}`}
                </div>
              </div>
              <div className={`text-2xl font-bold text-center ${progressColor}`}>{cur}%</div>
              <div className="text-center text-[10px] text-gray-500 dark:text-gray-400">capaian</div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                <div
                  className="h-3 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${cur}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyOverview;
