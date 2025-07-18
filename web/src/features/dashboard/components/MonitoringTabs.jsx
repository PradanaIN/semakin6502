import { useState, useCallback, memo } from "react";
import DailyOverview from "./DailyOverview";
import WeeklyOverview from "./WeeklyOverview";
import MonthlyOverview from "./MonthlyOverview";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";

import months from "../../../utils/months";

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
          <div className="flex gap-4 w-full sm:w-auto mt-4 sm:mt-0">
            {/* Listbox untuk bulan */}
            <div className="w-36">
              <Listbox value={monthIndex} onChange={onMonthChange}>
                <div className="relative mt-1">
                  <Listbox.Button
                    className="relative w-full cursor-pointer rounded-lg bg-gray-50 dark:bg-gray-800 
                    py-2 pl-4 pr-10 border border-gray-300 dark:border-gray-600 
                    shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                    transition duration-150 ease-in-out text-center"
                  >
                    <span className="block truncate">{months[monthIndex]}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options
                      className="absolute mt-1 max-h-60 w-full overflow-auto 
                      rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg 
                      ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50"
                    >
                      {months.map((month, i) => (
                        <Listbox.Option
                          key={i}
                          value={i}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
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
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
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
            </div>

            {/* Listbox untuk minggu */}
            {weeklyList.length > 0 && (
              <div className="w-32">
                <Listbox value={weekIndex} onChange={onWeekChange}>
                  <div className="relative mt-1">
                    <Listbox.Button
                      className="relative w-full cursor-pointer rounded-lg bg-gray-50 dark:bg-gray-800 
                      py-2 pl-4 pr-10 text-center border border-gray-300 dark:border-gray-600 
                      shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                      transition duration-150 ease-in-out"
                    >
                      <span className="block truncate">
                        Minggu {weeklyList[weekIndex]?.minggu}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options
                        className="absolute mt-1 max-h-60 w-full overflow-auto 
                        rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg 
                        ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50"
                      >
                        {weeklyList.map((w, i) => (
                          <Listbox.Option
                            key={i}
                            value={i}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
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
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
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
              </div>
            )}
          </div>
        )}
      </div>

      <div>{renderContent()}</div>
    </div>
  );
};

export default memo(MonitoringTabs);
