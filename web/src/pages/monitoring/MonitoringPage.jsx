import { useEffect, useState, Fragment, useCallback } from "react";
import axios from "axios";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import months from "../../utils/months";
import DateFilter from "../../components/ui/DateFilter";
import Table from "../../components/ui/Table";
import tableStyles from "../../components/ui/Table.module.css";
import Legend from "../../components/ui/Legend";
import DailyMatrix from "./DailyMatrix";
import WeeklyMatrix from "./WeeklyMatrix";
import { useAuth } from "../auth/useAuth";
import { ROLES } from "../../utils/roles";

export default function MonitoringPage() {
  const [tab, setTab] = useState("harian");
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState("");
  const { user } = useAuth();

  const [tanggal, setTanggal] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [weekIndex, setWeekIndex] = useState(0);
  const [weekStarts, setWeekStarts] = useState([]);

  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyMonthData, setWeeklyMonthData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);

  const mergeProgressWithUsers = useCallback(
    (data) => {
      const map = Object.fromEntries(data.map((d) => [d.userId, d]));
      return users.map((u) => ({
        userId: u.id,
        nama: u.nama,
        selesai: map[u.id]?.selesai || 0,
        total: map[u.id]?.total || 0,
        persen: map[u.id]?.persen || 0,
      }));
    },
    [users],
  );

  const mergeMatrixWithUsers = useCallback(
    (data) => {
      const base = new Date(tanggal);
      const year = base.getFullYear();
      const month = base.getMonth();
      const end = new Date(year, month + 1, 0);
      const empty = [];
      for (let d = 1; d <= end.getDate(); d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
          d,
        ).padStart(2, "0")}`;
        empty.push({ tanggal: dateStr, adaKegiatan: false });
      }
      const map = Object.fromEntries(data.map((d) => [d.userId, d.detail]));
      return users.map((u) => ({
        userId: u.id,
        nama: u.nama,
        detail: map[u.id] || empty,
      }));
    },
    [users, tanggal],
  );

  const mergeWeeklyMonthWithUsers = useCallback(
    (data) => {
      const emptyWeeks = weekStarts.map(() => ({ selesai: 0, total: 0, persen: 0 }));
      const map = Object.fromEntries(data.map((d) => [d.userId, d.weeks]));
      return users.map((u) => ({
        userId: u.id,
        nama: u.nama,
        weeks: map[u.id] || emptyWeeks,
      }));
    },
    [users, weekStarts],
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/users");
        const sorted = res.data.sort((a, b) => a.nama.localeCompare(b.nama));
        setAllUsers(sorted);
      } catch (err) {
        console.error("Gagal mengambil pengguna", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      if (user?.role === ROLES.ADMIN || user?.role === ROLES.KETUA) {
        try {
          const res = await axios.get("/teams");
          setTeams(res.data);
        } catch (err) {
          console.error("Gagal mengambil tim", err);
        }
      }
    };
    fetchTeams();
  }, [user?.role]);

  useEffect(() => {
    if (teamId) {
      const t = teams.find((tm) => tm.id === parseInt(teamId, 10));
      if (t) {
        const mem = t.members.map((m) => m.user);
        const sorted = mem.sort((a, b) => a.nama.localeCompare(b.nama));
        setUsers(sorted);
      }
    } else {
      setUsers(allUsers);
    }
  }, [teamId, teams, allUsers]);

  // generate week start dates when month changes
  useEffect(() => {
    const year = new Date().getFullYear();
    const firstOfMonth = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    const firstMonday = new Date(firstOfMonth);
    firstMonday.setDate(firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7));
    const starts = [];
    for (let d = new Date(firstMonday); d <= monthEnd; d.setDate(d.getDate() + 7)) {
      starts.push(new Date(d));
    }
    setWeekStarts(starts);
    if (weekIndex >= starts.length) setWeekIndex(0);
  }, [monthIndex, weekIndex]);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/monitoring/harian/bulan", {
          params: { tanggal, teamId: teamId || undefined },
        });
        setDailyData(mergeMatrixWithUsers(res.data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDaily();
  }, [tanggal, teamId, mergeMatrixWithUsers]);

  useEffect(() => {
    if (!weekStarts.length) return;
    const fetchWeekly = async () => {
      try {
        setLoading(true);
        const minggu = weekStarts[weekIndex].toISOString().slice(0, 10);
        const res = await axios.get("/monitoring/mingguan/all", {
          params: { minggu, teamId: teamId || undefined },
        });
        setWeeklyData(mergeProgressWithUsers(res.data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeekly();
  }, [weekIndex, weekStarts, teamId, mergeProgressWithUsers]);

  useEffect(() => {
    if (!weekStarts.length) return;
    const fetchWeeklyMonth = async () => {
      try {
        setLoading(true);
        const year = new Date().getFullYear();
        const first = new Date(year, monthIndex, 1).toISOString().slice(0, 10);
        const res = await axios.get('/monitoring/mingguan/bulan', {
          params: { tanggal: first, teamId: teamId || undefined },
        });
        setWeeklyMonthData(mergeWeeklyMonthWithUsers(res.data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeeklyMonth();
  }, [monthIndex, teamId, weekStarts, mergeWeeklyMonthWithUsers]);

  useEffect(() => {
    const fetchMonthly = async () => {
      try {
        setLoading(true);
        const year = new Date().getFullYear();
        const res = await axios.get("/monitoring/bulanan/all", {
          params: { year, teamId: teamId || undefined },
        });
        setMonthlyData(mergeProgressWithUsers(res.data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthly();
  }, [monthIndex, teamId, mergeProgressWithUsers]);

  const renderRows = (data) => {
    const colorFor = (p) => {
      if (p >= 80) return "green";
      if (p >= 50) return "yellow";
      return "red";
    };

    return data.map((d, i) => {
      const color = colorFor(d.persen);
      const progressColor =
        color === "green"
          ? "bg-green-500"
          : color === "yellow"
          ? "bg-yellow-500"
          : "bg-red-500";
      const textColor =
        color === "green"
          ? "text-green-600"
          : color === "yellow"
          ? "text-yellow-600"
          : "text-red-600";

      return (
        <tr
          key={d.userId || i}
          className={`${tableStyles.row} border-t dark:border-gray-700 text-center`}
        >
          <td className={tableStyles.cell}>{i + 1}</td>
          <td className={tableStyles.cell}>{d.nama}</td>
          <td className={tableStyles.cell}>{d.selesai}</td>
          <td className={tableStyles.cell}>{d.total}</td>
          <td className={`${tableStyles.cell} space-y-1`}>
            <div
              role="progressbar"
              aria-valuenow={d.persen}
              aria-valuemin="0"
              aria-valuemax="100"
              className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2"
            >
              <div
                className={`${progressColor} h-2 rounded`}
                style={{ width: `${d.persen}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${textColor}`}>{d.persen}%</span>
          </td>
        </tr>
      );
    });
  };

  const renderTable = (data) => {
    const totalTasks = data.reduce((sum, d) => sum + d.total, 0);
    return (
      <>
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
        <p className="text-sm text-right mt-2">
          Total semua tugas: <span className="font-semibold">{totalTasks}</span>
        </p>
      </>
    );
  };

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
            {['harian', 'mingguan', 'bulanan'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                role="tab"
                aria-selected={tab === t}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  tab === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'harian' && (
            <DateFilter tanggal={tanggal} setTanggal={setTanggal} setCurrentPage={() => {}} />
          )}

          {tab === 'mingguan' && (
            <div className="flex gap-4 w-full sm:w-auto mt-4 sm:mt-0">
              <div className="w-36">
                <Listbox value={monthIndex} onChange={setMonthIndex}>
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-50 dark:bg-gray-800 py-2 pl-4 pr-10 text-center border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                      <span className="block truncate">{months[monthIndex]}</span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                        {months.map((m, i) => (
                          <Listbox.Option
                            key={i}
                            value={i}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-blue-100 dark:bg-gray-600 text-blue-900 dark:text-white' : 'text-gray-900 dark:text-gray-100'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{m}</span>
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

              {weekOptions.length > 0 && (
                <div className="w-48">
                  <Listbox value={weekIndex} onChange={setWeekIndex}>
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-50 dark:bg-gray-800 py-2 pl-4 pr-10 text-center border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                        <span className="block truncate">{weekOptions[weekIndex]?.label}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>
                      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                          {weekOptions.map((w) => (
                            <Listbox.Option
                              key={w.value}
                              value={w.value}
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-blue-100 dark:bg-gray-600 text-blue-900 dark:text-white' : 'text-gray-900 dark:text-gray-100'
                                }`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{w.label}</span>
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
              )}
            </div>
          )}

          {tab === 'bulanan' && (
            <div className="w-36 mt-4 sm:mt-0">
              <Listbox value={monthIndex} onChange={setMonthIndex}>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-50 dark:bg-gray-800 py-2 pl-4 pr-10 text-center border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                    <span className="block truncate">{months[monthIndex]}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                      {months.map((m, i) => (
                        <Listbox.Option
                          key={i}
                          value={i}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-blue-100 dark:bg-gray-600 text-blue-900 dark:text-white' : 'text-gray-900 dark:text-gray-100'
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{m}</span>
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
          )}

          {(user?.role === ROLES.ADMIN || user?.role === ROLES.KETUA) && (
            <div className="w-48 mt-4 sm:mt-0">
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="cursor-pointer border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 dark:hover:border-blue-400 shadow-sm transition duration-150 ease-in-out text-center w-full"
              >
                <option value="">Semua Tim</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama_tim}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div>Memuat...</div>
        ) : (
          <div>
            {tab === 'harian' && (
              <>
                <Legend className="mb-2" />
                <DailyMatrix data={dailyData} />
              </>
            )}
            {tab === 'mingguan' && (
              <>
                <WeeklyMatrix
                  data={weeklyMonthData}
                  weeks={weekStarts}
                  onSelectWeek={setWeekIndex}
                />
                <div className="mt-4">{renderTable(weeklyData)}</div>
              </>
            )}
            {tab === 'bulanan' && renderTable(monthlyData)}
          </div>
        )}
      </div>
    </div>
  );
}

