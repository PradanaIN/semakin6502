import React, { useEffect, useState, Fragment, useCallback } from "react";
import axios from "axios";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import months from "../../utils/months";
import Legend from "../../components/ui/Legend";
import DailyMatrix, { DailyMatrixRow } from "./DailyMatrix";
import WeeklyMatrix, { WeeklyMatrixRow } from "./WeeklyMatrix";
import MonthlyMatrix, { MonthlyMatrixRow } from "../../components/monitoring/MonthlyMatrix";
import { FixedSizeList as List } from "react-window";
import { getHolidays } from "../../utils/holidays";
import { useAuth } from "../auth/useAuth";
import { ROLES } from "../../utils/roles";

export default function MonitoringPage() {
  const [tab, setTab] = useState("harian");
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState("");
  const { user } = useAuth();

  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [weekIndex, setWeekIndex] = useState(0);
  const [weekStarts, setWeekStarts] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  const [dailyData, setDailyData] = useState([]);
  const [, setWeeklyData] = useState([]);
  const [weeklyMonthData, setWeeklyMonthData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ROW_HEIGHT = 40;

  const dailyBoxClass = (() => {
    const today = new Date().toISOString().slice(0, 10);
    const year = new Date().getFullYear();
    const HOLIDAYS = getHolidays(year);
    const isWeekend = (iso) => {
      const d = new Date(iso);
      const g = d.getDay();
      return g === 0 || g === 6;
    };
    const isHoliday = (iso) => HOLIDAYS.includes(iso);
    return (day) => {
      if (day.adaKegiatan) {
        return "bg-green-200 border-green-400 dark:bg-green-700 dark:border-green-500";
      }
      if (isWeekend(day.tanggal) || isHoliday(day.tanggal)) {
        return "bg-blue-200 border-blue-400 dark:bg-blue-700 dark:border-blue-500";
      }
      if (day.tanggal < today) {
        return "bg-yellow-200 border-yellow-400 dark:bg-yellow-700 dark:border-yellow-500";
      }
      return "bg-gray-100 dark:bg-gray-700";
    };
  })();

  const progressColor = (p) => {
    if (p >= 80) return "bg-green-500";
    if (p >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const TBody = React.forwardRef(function TBody(props, ref) {
    return <tbody ref={ref} {...props} />;
  });

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
    [users]
  );

  const mergeMatrixWithUsers = useCallback(
    (data) => {
      const year = new Date().getFullYear();
      const month = monthIndex;
      const end = new Date(year, month + 1, 0);
      const empty = [];
      for (let d = 1; d <= end.getDate(); d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
          d
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
    [users, monthIndex]
  );

  const mergeWeeklyMonthWithUsers = useCallback(
    (data) => {
      const emptyWeeks = weekStarts.map(() => ({
        selesai: 0,
        total: 0,
        persen: 0,
      }));
      const map = Object.fromEntries(data.map((d) => [d.userId, d.weeks]));
      return users.map((u) => ({
        userId: u.id,
        nama: u.nama,
        weeks: map[u.id] || emptyWeeks,
      }));
    },
    [users, weekStarts]
  );

  const mergeMonthlyMatrixWithUsers = useCallback(
    (data) => {
      const emptyMonths = months.map(() => ({
        selesai: 0,
        total: 0,
        persen: 0,
      }));
      const map = Object.fromEntries(data.map((d) => [d.userId, d.months]));
      return users.map((u) => ({
        userId: u.id,
        nama: u.nama,
        months: map[u.id] || emptyMonths,
      }));
    },
    [users]
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/users");
        const filtered = res.data.filter((u) => u.role !== "admin");
        const sorted = filtered.sort((a, b) => a.nama.localeCompare(b.nama));
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
        const mem = t.members
          .map((m) => m.user)
          .filter((u) => u.role !== "admin");
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
        const year = new Date().getFullYear();
        const first = new Date(year, monthIndex, 1).toISOString().slice(0, 10);
        const res = await axios.get("/monitoring/harian/bulan", {
          params: { tanggal: first, teamId: teamId || undefined },
        });
        setDailyData(mergeMatrixWithUsers(res.data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDaily();
  }, [monthIndex, teamId, mergeMatrixWithUsers]);

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
        const res = await axios.get("/monitoring/mingguan/bulan", {
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
        const res = await axios.get("/monitoring/bulanan/matrix", {
          params: {
            year,
            bulan: monthIndex + 1,
            teamId: teamId || undefined,
          },
        });
        setMonthlyData(mergeMonthlyMatrixWithUsers(res.data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthly();
  }, [year, teamId, mergeMonthlyMatrixWithUsers]);


  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const dayCount = dailyData[0]?.detail.length || 0;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
        <div className="flex flex-wrap items-center mb-4">
          {/* tab di kiri */}
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

          {/* filter select di kanan */}
          <div className="flex flex-wrap items-center gap-4 ml-auto mt-4 sm:mt-0">
            {tab === "harian" && (
              <div className="w-36 mt-4 sm:mt-0">
                <Listbox value={monthIndex} onChange={setMonthIndex}>
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-gray-50 dark:bg-gray-800 py-2 pl-4 pr-10 text-center border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
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
              </div>
            )}

            {tab === "bulanan" && (
              <div className="w-32 mt-4 sm:mt-0">
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  className="cursor-pointer border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 dark:hover:border-blue-400 shadow-sm transition duration-150 ease-in-out text-center w-full"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(user?.role === ROLES.ADMIN || user?.role === ROLES.KETUA) && (
              <div className="w-32 mt-4 sm:mt-0">
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
        </div>

        {loading ? (
          <div>Memuat...</div>
        ) : (
          <div>
            {tab === "harian" && (
              <>
                <div className="overflow-auto" style={{ maxHeight: 400 }}>
                  <table className="min-w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 border text-left">Nama</th>
                        {Array.from({ length: dayCount }, (_, i) => (
                          <th key={i} className="p-1 border text-center">{i + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <List
                      height={Math.min(400, ROW_HEIGHT * dailyData.length)}
                      itemCount={dailyData.length}
                      itemSize={ROW_HEIGHT}
                      width="100%"
                      outerElementType={TBody}
                      itemData={dailyData}
                    >
                      {({ index, style, data }) => (
                        <DailyMatrixRow
                          style={style}
                          user={data[index]}
                          boxClass={dailyBoxClass}
                        />
                      )}
                    </List>
                  </table>
                </div>
                <Legend className="mt-2" />
              </>
            )}
            {tab === "mingguan" && (
              <div className="overflow-auto" style={{ maxHeight: 400 }}>
                <table className="min-w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border text-left">Nama</th>
                      {weekStarts.map((_, i) => (
                        <th
                          key={i}
                          onClick={() => setWeekIndex(i)}
                          className="p-2 border text-center cursor-pointer"
                        >
                          Minggu {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <List
                    height={Math.min(400, ROW_HEIGHT * weeklyMonthData.length)}
                    itemCount={weeklyMonthData.length}
                    itemSize={ROW_HEIGHT}
                    width="100%"
                    outerElementType={TBody}
                    itemData={weeklyMonthData}
                  >
                    {({ index, style, data }) => (
                      <WeeklyMatrixRow
                        style={style}
                        user={data[index]}
                        progressColor={(p) => progressColor(p)}
                      />
                    )}
                  </List>
                </table>
              </div>
            )}
            {tab === "bulanan" && (
              <div className="overflow-auto" style={{ maxHeight: 400 }}>
                <table className="min-w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border text-left">Nama</th>
                      {months.map((m, i) => (
                        <th key={i} className="p-2 border text-center whitespace-nowrap">
                          {m.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <List
                    height={Math.min(400, ROW_HEIGHT * monthlyData.length)}
                    itemCount={monthlyData.length}
                    itemSize={ROW_HEIGHT}
                    width="100%"
                    outerElementType={TBody}
                    itemData={monthlyData}
                  >
                    {({ index, style, data }) => (
                      <MonthlyMatrixRow
                        style={style}
                        user={data[index]}
                        progressColor={(p) => progressColor(p)}
                      />
                    )}
                  </List>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
