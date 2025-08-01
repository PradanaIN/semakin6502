import { useState, useCallback, memo, Fragment } from "react";
import DailyOverview from "./DailyOverview";
import WeeklyOverview from "./WeeklyOverview";
import MonthlyOverview from "./MonthlyOverview";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import months from "../../../utils/months";

const MonitoringTabs = ({
  dailyData,
  weeklyList = [],
  weekIndex = 0,
  onWeekChange,
  monthIndex = 0,
  onMonthChange,
  monthlyData,
  year,
  onYearChange,
}) => {
  const [tab, setTab] = useState("harian");
  const clampedWeekIndex = weeklyList.length
    ? Math.min(Math.max(weekIndex, 0), weeklyList.length - 1)
    : 0;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const renderContent = useCallback(() => {
    switch (tab) {
      case "harian":
        return <DailyOverview data={dailyData} />;
      case "mingguan":
        return <WeeklyOverview data={weeklyList[clampedWeekIndex]} />;
      case "bulanan":
        return <MonthlyOverview data={monthlyData} />;
      default:
        return null;
    }
  }, [tab, dailyData, weeklyList, clampedWeekIndex, monthlyData]);

  const handleTabClick = useCallback((t) => setTab(t), []);

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2" role="tablist">
          {["harian", "mingguan", "bulanan"].map((type) => (
            <button
              key={type}
              onClick={() => handleTabClick(type)}
              role="tab"
              aria-selected={tab === type}
              className={`px-4 py-2 rounded-lg font-semibold capitalize transition text-sm
                ${
                  tab === type
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex gap-4 flex-wrap">
          {/* Tahun */}
          <Listbox value={year} onChange={onYearChange}>
            <div className="relative w-28">
              <Listbox.Button
                className="w-full cursor-pointer rounded-lg bg-gray-50 dark:bg-gray-800
                    py-2 pl-4 pr-10 text-sm text-center border border-gray-300 dark:border-gray-600
                    shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="block truncate">{year}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options
                  className="absolute z-50 mt-1 max-h-60 w-full overflow-auto
                      rounded-md bg-white dark:bg-gray-700 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5"
                >
                  {years.map((y) => (
                    <Listbox.Option
                      key={y}
                      value={y}
                      className={({ active }) =>
                        `cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active
                            ? "bg-blue-100 dark:bg-gray-600 text-blue-900 dark:text-white"
                            : "text-gray-900 dark:text-gray-100"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                            {y}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                              <CheckIcon className="h-5 w-5" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>

          {/* Bulan */}
          {["harian", "mingguan"].includes(tab) && (
            <Listbox value={monthIndex} onChange={onMonthChange}>
              <div className="relative w-36">
                <Listbox.Button
                  className="w-full cursor-pointer rounded-lg bg-gray-50 dark:bg-gray-800
                    py-2 pl-4 pr-10 text-sm text-center border border-gray-300 dark:border-gray-600
                    shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="block truncate">{months[monthIndex]}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-auto
                      rounded-md bg-white dark:bg-gray-700 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5"
                  >
                    {months.map((month, i) => (
                      <Listbox.Option
                        key={i}
                        value={i}
                        className={({ active }) =>
                          `cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active
                              ? "bg-blue-100 dark:bg-gray-600 text-blue-900 dark:text-white"
                              : "text-gray-900 dark:text-gray-100"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              {month}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                <CheckIcon className="h-5 w-5" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          )}

          {/* Minggu */}
          {tab === "mingguan" && weeklyList.length > 0 && (
            <Listbox value={clampedWeekIndex} onChange={onWeekChange}>
              <div className="relative w-32">
                <Listbox.Button
                  className="w-full cursor-pointer rounded-lg bg-gray-50 dark:bg-gray-800
                      py-2 pl-4 pr-10 text-sm text-center border border-gray-300 dark:border-gray-600
                      shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="block truncate">
                    Minggu {weeklyList[clampedWeekIndex]?.minggu}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-auto
                        rounded-md bg-white dark:bg-gray-700 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5"
                  >
                    {weeklyList.map((w, i) => (
                      <Listbox.Option
                        key={i}
                        value={i}
                        className={({ active }) =>
                          `cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active
                              ? "bg-blue-100 dark:bg-gray-600 text-blue-900 dark:text-white"
                              : "text-gray-900 dark:text-gray-100"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              Minggu {w.minggu}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                <CheckIcon className="h-5 w-5" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div>{renderContent()}</div>
    </div>
  );
};

export default memo(MonitoringTabs);
