import { useState } from "react";
import DailyOverview from "./DailyOverview";
import WeeklyOverview from "./WeeklyOverview";
import MonthlyOverview from "./MonthlyOverview";

const MonitoringTabs = ({
  dailyData,
  weeklyList = [],
  weekIndex = 0,
  onWeekChange,
  monthlyProgress,
}) => {
  const [tab, setTab] = useState("harian");

  const renderContent = () => {
    switch (tab) {
      case "harian":
        return <DailyOverview data={dailyData} />;
      case "mingguan":
        return (
          <div className="space-y-3">
            {weeklyList.length > 1 && (
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
            <WeeklyOverview data={weeklyList[weekIndex]} />
          </div>
        );
      case "bulanan":
        return <MonthlyOverview data={monthlyProgress} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
      <div className="flex space-x-3 mb-4">
        {["harian", "mingguan", "bulanan"].map((type) => (
          <button
            key={type}
            onClick={() => setTab(type)}
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
      <div>{renderContent()}</div>
    </div>
  );
};

export default MonitoringTabs;
