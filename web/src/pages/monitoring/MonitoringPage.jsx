import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import months from "../../utils/months";
import DateFilter from "../../components/ui/DateFilter";
import Table from "../../components/ui/Table";
import tableStyles from "../../components/ui/Table.module.css";

export default function MonitoringPage() {
  const [tab, setTab] = useState("harian");
  const [users, setUsers] = useState([]);

  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [weekIndex, setWeekIndex] = useState(0);
  const [weekStarts, setWeekStarts] = useState([]);

  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/users");
        const sorted = res.data.sort((a, b) => a.nama.localeCompare(b.nama));
        setUsers(sorted);
      } catch (err) {
        console.error("Gagal mengambil pengguna", err);
      }
    };
    fetchUsers();
  }, []);

  // generate week start dates when month changes
  useEffect(() => {
    const year = new Date().getFullYear();
    const firstOfMonth = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    const firstMonday = new Date(firstOfMonth);
    firstMonday.setDate(
      firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7)
    );
    const starts = [];
    for (
      let d = new Date(firstMonday);
      d <= monthEnd;
      d.setDate(d.getDate() + 7)
    ) {
      starts.push(new Date(d));
    }
    setWeekStarts(starts);
    if (weekIndex >= starts.length) setWeekIndex(0);
  }, [monthIndex, weekIndex]);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/monitoring/aggregated/harian", {
          params: { tanggal },
        });
        const map = Object.fromEntries(users.map((u) => [u.id, u.nama]));
        setDailyData(
          res.data.map((d) => ({ ...d, nama: d.nama || map[d.userId] || "-" }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDaily();
  }, [tanggal, users]);

  useEffect(() => {
    if (!weekStarts.length) return;
    const fetchWeekly = async () => {
      try {
        setLoading(true);
        const minggu = weekStarts[weekIndex].toISOString().slice(0, 10);
        const res = await axios.get("/monitoring/aggregated/mingguan", {
          params: { minggu },
        });
        const map = Object.fromEntries(users.map((u) => [u.id, u.nama]));
        setWeeklyData(
          res.data.map((d) => ({ ...d, nama: d.nama || map[d.userId] || "-" }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeekly();
  }, [weekIndex, weekStarts, users]);

  useEffect(() => {
    const fetchMonthly = async () => {
      try {
        setLoading(true);
        const year = new Date().getFullYear();
        const bulan = monthIndex + 1;
        const res = await axios.get("/monitoring/aggregated/bulanan", {
          params: { year, bulan },
        });
        const map = Object.fromEntries(users.map((u) => [u.id, u.nama]));
        setMonthlyData(
          res.data.map((d) => ({ ...d, nama: d.nama || map[d.userId] || "-" }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthly();
  }, [monthIndex, users]);

  const renderRows = (data) => {
    return data.map((d, i) => (
      <tr
        key={d.userId || i}
        className={`${tableStyles.row} border-t dark:border-gray-700 text-center`}
      >
        <td className={tableStyles.cell}>{i + 1}</td>
        <td className={tableStyles.cell}>{d.nama}</td>
        <td className={tableStyles.cell}>{d.selesai}</td>
        <td className={tableStyles.cell}>{d.total}</td>
        <td className={tableStyles.cell}>{d.persen}%</td>
      </tr>
    ));
  };

  const renderTable = (data) => (
    <Table>
      <thead>
        <tr className={tableStyles.headerRow}>
          <th className={tableStyles.cell}>No</th>
          <th className={tableStyles.cell}>Nama</th>
          <th className={tableStyles.cell}>Selesai</th>
          <th className={tableStyles.cell}>Total</th>
          <th className={tableStyles.cell}>%</th>
        </tr>
      </thead>
      <tbody>{renderRows(data)}</tbody>
    </Table>
  );

  const weekOptions = weekStarts.map((d, i) => {
    return {
      label: `Minggu ${i + 1} bulan ${months[monthIndex]}`,
      value: i,
    };
  });

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex flex-wrap gap-2" role="tablist">
            {["harian", "mingguan", "bulanan"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                role="tab"
                aria-selected={tab === t}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  tab === t
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === "harian" && (
            <DateFilter
              tanggal={tanggal}
              setTanggal={setTanggal}
              setCurrentPage={() => {}}
            />
          )}

          {tab === "mingguan" && (
            <div className="flex gap-4 w-full sm:w-auto mt-4 sm:mt-0">
              <div className="w-36">
                <Listbox value={monthIndex} onChange={setMonthIndex}>
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-50 dark:bg-gray-800 py-2 pl-4 pr-10 text-center border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                      <span className="block truncate">
                        {months[monthIndex]}
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
                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
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

              {weekOptions.length > 0 && (
                <div className="w-48">
                  <Listbox value={weekIndex} onChange={setWeekIndex}>
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-50 dark:bg-gray-800 py-2 pl-4 pr-10 text-center border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                        <span className="block truncate">
                          {weekOptions[weekIndex]?.label}
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
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                          {weekOptions.map((w) => (
                            <Listbox.Option
                              key={w.value}
                              value={w.value}
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
                                    {w.label}
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

          {tab === "bulanan" && (
            <div className="w-36 mt-4 sm:mt-0">
              <Listbox value={monthIndex} onChange={setMonthIndex}>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-50 dark:bg-gray-800 py-2 pl-4 pr-10 text-center border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
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
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
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

        {loading ? (
          <div>Memuat...</div>
        ) : (
          <div>
            {tab === "harian" && renderTable(dailyData)}
            {tab === "mingguan" && renderTable(weeklyData)}
            {tab === "bulanan" && renderTable(monthlyData)}
          </div>
        )}
      </div>
    </div>
  );
}
