import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import months from "../../utils/months";

export default function MonthYearPicker({ month, onMonthChange }) {
  // catatan: month di sini harus disamakan dengan index (1-based), sesuai value kamu sebelumnya

  return (
    <div className="w-36">
      <Listbox value={month} onChange={onMonthChange}>
        <div className="relative mt-1">
          <Listbox.Button
            className="relative w-full cursor-pointer rounded-xl bg-gray-50 dark:bg-gray-800 
            py-2 pl-4 pr-10 text-center border border-gray-300 dark:border-gray-600 
            shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
            transition duration-150 ease-in-out"
          >
            <span className="block truncate">
              {month ? months[month - 1] : "Bulan"}
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
              rounded-xl bg-white dark:bg-gray-700 py-1 text-base shadow-lg 
              ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50"
            >
              <Listbox.Option
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
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      Bulan
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
              {months.map((m, i) => (
                <Listbox.Option
                  key={i + 1}
                  value={i + 1}
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
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
  );
}
