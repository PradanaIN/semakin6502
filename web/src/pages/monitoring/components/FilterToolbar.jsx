import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import months from "../../../utils/months";

export default function FilterToolbar({
  tab,
  monthlyMode,
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
}) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const baseButtonClass =
    "relative w-full cursor-pointer rounded-xl bg-gray-50 dark:bg-gray-800 py-2 pl-4 pr-10 border border-gray-300 dark:border-gray-600 shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500";
  // Dropdown menu di bawah header tabel, tapi tidak menutupi sidebar/toast
  const baseOptionsClass =
    "absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none";

  return (
    <div className="flex flex-wrap gap-3 items-center justify-start">
      {/* Filter Bulan */}
      {(tab === "harian" || tab === "mingguan" || (tab === "bulanan" && monthlyMode === "current")) && (
        <div className="w-36">
          <Listbox value={monthIndex} onChange={setMonthIndex}>
            <div className="relative">
              <Listbox.Button className={baseButtonClass}>
                <span className="block truncate">{months[monthIndex]}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Listbox.Options className={baseOptionsClass}>
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
                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                          {m}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
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
              <Listbox.Button className={baseButtonClass}>
                <span className="block truncate">Minggu {weekIndex + 1}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Listbox.Options className={baseOptionsClass}>
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
                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                          Minggu {i + 1}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
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
      {(tab === "bulanan" || tab === "harian") && (
        <div className="w-32">
          <Listbox value={year} onChange={(val) => setYear(Number(val))}>
            <div className="relative">
              <Listbox.Button className={baseButtonClass} aria-label="Pilih Tahun">
                <span className="block truncate">{year}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Listbox.Options className={baseOptionsClass}>
                {yearOptions.map((y) => (
                  <Listbox.Option
                    key={y}
                    value={y}
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
                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{y}</span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
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

      {/* Filter Tim */}
      <div className="w-40">
        <Listbox value={teamId} onChange={setTeamId}>
          <div className="relative">
            <Listbox.Button className={baseButtonClass} aria-label="Pilih Tim">
              <span className="block truncate">
                {(() => {
                  if (!teamId) return "Semua Tim";
                  const t = teams.find((x) => x.id === teamId);
                  return t ? t.namaTim : "Semua Tim";
                })()}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Listbox.Options className={baseOptionsClass}>
              <Listbox.Option
                key="all"
                value=""
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
                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>Semua Tim</span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                        <CheckIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
              {(Array.isArray(teams) ? teams : [])
                .filter((t) => t.namaTim !== "Pimpinan")
                .map((t) => (
                  <Listbox.Option
                    key={t.id}
                    value={t.id}
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
                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{t.namaTim}</span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
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
    </div>
  );
}
