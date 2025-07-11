import { useState } from "react";
import DailyOverview from "./DailyOverview";
import WeeklyOverview from "./WeeklyOverview";
import MonthlyOverview from "./MonthlyOverview";

const MonitoringTabs = ({ dailyData, weeklyData, monthlyData }) => {
  const [tab, setTab] = useState("harian");

  const renderContent = () => {
    switch (tab) {
      case "harian":
        return <DailyOverview data={dailyData} />;
      case "mingguan":
        return <WeeklyOverview data={weeklyData} />;
      case "bulanan":
        return <MonthlyOverview data={monthlyData} />;
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
