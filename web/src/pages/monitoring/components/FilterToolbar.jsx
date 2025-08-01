import React from "react";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import months from "../../../utils/months";

export default function FilterToolbar({
  tab,
  monthIndex,
  setMonthIndex,
  weekIndex,
  setWeekIndex,
  weekStarts = [],
  year,
  setYear,
  teamId,
  setTeamId,
  teams = [],
  userRole,
}) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const baseSelectClass =
    "cursor-pointer border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 dark:hover:border-blue-400 shadow-sm transition duration-150 ease-in-out w-full text-center";

  return (
    <div className="flex flex-wrap gap-3 items-center justify-start">
      {/* Filter Bulan */}
      {(tab === "harian" || tab === "mingguan") && (
        <div className="w-36">
          <Listbox value={monthIndex} onChange={setMonthIndex}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-gray-50 dark:bg-gray-800 py-2 pl-4 pr-10 border border-gray-300 dark:border-gray-600 shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500">
                <span className="block truncate">{months[monthIndex]}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5">
                {months.map((m, i) => (
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
                          {m}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                            ✓
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>
      )}

      {/* Filter Minggu */}
      {tab === "mingguan" && weekStarts.length > 0 && (
        <div className="w-36">
          <Listbox value={weekIndex} onChange={setWeekIndex}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-gray-50 dark:bg-gray-800 py-2 pl-4 pr-10 border border-gray-300 dark:border-gray-600 shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500">
                <span className="block truncate">Minggu {weekIndex + 1}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5">
                {weekStarts.map((_, i) => (
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
                          Minggu {i + 1}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                            ✓
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>
      )}

      {/* Filter Tahun */}
      {tab === "bulanan" && (
        <div className="w-32">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className={baseSelectClass}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filter Tim */}
      {(userRole === "admin" ||
        userRole === "ketua" ||
        userRole === "pimpinan") && (
        <div className="w-40">
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className={baseSelectClass}
          >
            <option value="">Semua Tim</option>
            {teams
              .filter((t) => t.namaTim !== "Pimpinan")
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.namaTim}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
}
