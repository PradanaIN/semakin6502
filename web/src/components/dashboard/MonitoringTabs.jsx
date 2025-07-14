import { useState, useCallback, memo } from "react";
import DailyOverview from "./DailyOverview";
import WeeklyOverview from "./WeeklyOverview";
import MonthlyOverview from "./MonthlyOverview";

import months from "../../utils/months";

const MonitoringTabs = ({
  dailyData,
  weeklyList = [],
  weekIndex = 0,
  onWeekChange,
  monthIndex = 0,
  onMonthChange,
  monthlyData,
}) => {
  const [tab, setTab] = useState("harian");

  const renderContent = useCallback(() => {
    switch (tab) {
      case "harian":
        return <DailyOverview data={dailyData} />;
      case "mingguan":
        return <WeeklyOverview data={weeklyList[weekIndex]} />;
      case "bulanan":
        return <MonthlyOverview data={monthlyData} />;
      default:
        return null;
    }
  }, [tab, dailyData, weeklyList, weekIndex, monthlyData]);

  const handleTabClick = useCallback((t) => setTab(t), []);

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div className="flex flex-wrap gap-2" role="tablist">
          {["harian", "mingguan", "bulanan"].map((type) => (
            <button
              key={type}
              onClick={() => handleTabClick(type)}
              role="tab"
              aria-selected={tab === type}
              className={`px-4 py-2 rounded-lg font-semibold ${
                tab === type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        {tab === "mingguan" && (
          <div className="ml-auto flex gap-2">
            <select
              className="border rounded-md px-2 py-1 bg-gray-100 dark:bg-gray-700"
              value={monthIndex}
              onChange={(e) => onMonthChange?.(parseInt(e.target.value, 10))}
            >
              {months.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
            {weeklyList.length > 0 && (
              <select
                className="border rounded-md px-2 py-1 bg-gray-100 dark:bg-gray-700"
                value={weekIndex}
                onChange={(e) => onWeekChange?.(parseInt(e.target.value, 10))}
              >
                {weeklyList.map((w, i) => (
                  <option key={i} value={i}>
                    Minggu {w.minggu}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};

export default memo(MonitoringTabs);
