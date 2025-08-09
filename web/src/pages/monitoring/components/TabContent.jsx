import React, { useEffect, useState } from "react";
import DailyMatrix from "../DailyMatrix";
import WeeklyMatrix from "../WeeklyMatrix";
import MonthlyMatrix from "./MonthlyMatrix";
import WeeklyProgressTable from "./WeeklyProgressTable";
import TableSkeleton from "../../../components/ui/TableSkeleton";
import Legend from "../../../components/ui/Legend";
import axios from "axios";
import { handleAxiosError } from "../../../utils/alerts";

export default function TabContent({
  activeTab,
  monthIndex,
  weekIndex,
  weekStarts,
  year,
  teamId = "",
}) {
  const [loading, setLoading] = useState(false);
  const [dailyData, setDailyData] = useState([]);
  const [weeklyMonthData, setWeeklyMonthData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyMode, setWeeklyMode] = useState("summary");

  const skeletonCols =
    activeTab === "harian" ? 7 : activeTab === "mingguan" ? 4 : 12;

  useEffect(() => {
    if (activeTab === "mingguan") setWeeklyMode("summary");
  }, [activeTab]);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        setLoading(true);
        const first = new Date(Date.UTC(year, monthIndex, 1)).toISOString();
        const res = await axios.get("/monitoring/harian/bulan", {
          params: { tanggal: first, teamId: teamId || undefined },
        });
        setDailyData(res.data);
      } catch (err) {
        handleAxiosError(err, "Gagal mengambil monitoring harian");
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "harian") fetchDaily();
  }, [activeTab, monthIndex, teamId, year]);

  useEffect(() => {
    const fetchWeekly = async () => {
      if (!weekStarts.length || activeTab !== "mingguan") return;
      try {
        setLoading(true);
        const minggu = new Date(weekStarts[weekIndex]).toISOString();
        const res = await axios.get("/monitoring/mingguan/all", {
          params: { minggu, teamId: teamId || undefined },
        });
        setWeeklyData(res.data);
      } catch (err) {
        handleAxiosError(err, "Gagal mengambil monitoring mingguan");
      } finally {
        setLoading(false);
      }
    };
    fetchWeekly();
  }, [activeTab, weekIndex, weekStarts, teamId, year]);

  useEffect(() => {
    const fetchWeeklyMonth = async () => {
      if (activeTab !== "mingguan") return;
      try {
        setLoading(true);
        const first = new Date(Date.UTC(year, monthIndex, 1)).toISOString();
        const res = await axios.get("/monitoring/mingguan/bulan", {
          params: { tanggal: first, teamId: teamId || undefined },
        });
        setWeeklyMonthData(res.data);
      } catch (err) {
        handleAxiosError(err, "Gagal mengambil monitoring mingguan per bulan");
      } finally {
        setLoading(false);
      }
    };
    fetchWeeklyMonth();
  }, [activeTab, monthIndex, teamId, year]);

  useEffect(() => {
    const fetchMonthly = async () => {
      if (activeTab !== "bulanan") return;
      try {
        setLoading(true);
        const res = await axios.get("/monitoring/bulanan/matrix", {
          params: { year, teamId: teamId || undefined },
        });
        setMonthlyData(res.data);
      } catch (err) {
        handleAxiosError(err, "Gagal mengambil monitoring bulanan");
      } finally {
        setLoading(false);
      }
    };
    fetchMonthly();
  }, [activeTab, year, teamId]);

  if (loading) {
    return <TableSkeleton cols={skeletonCols + 1} />;
  }

  return (
    <div>
      {/* HARIAN */}
      {activeTab === "harian" && (
        <>
          <Legend className="mb-3" />
          <DailyMatrix data={dailyData} monthIndex={monthIndex} year={year} />
        </>
      )}

      {/* MINGGUAN */}
      {activeTab === "mingguan" && (
        <>
          <div className="flex flex-wrap gap-2 mb-4" role="tablist">
            {["summary", "matrix"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setWeeklyMode(mode)}
                role="tab"
                aria-selected={weeklyMode === mode}
                className={`px-4 py-1.5 rounded-lg font-semibold text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150 ease-in-out
                  ${
                    weeklyMode === mode
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }
                `}
              >
                {mode === "summary"
                  ? "Ringkasan Minggu Ini"
                  : "Ringkasan per Minggu"}
              </button>
            ))}
          </div>

          {weeklyMode === "matrix" ? (
            <WeeklyMatrix
              data={weeklyMonthData}
              weeks={weekStarts}
              selectedWeek={weekIndex}
              onSelectWeek={() => {}}
            />
          ) : (
            <div>
              <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
                Ringkasan Minggu ke-{weekIndex + 1}
              </h3>
              <WeeklyProgressTable data={weeklyData} />
            </div>
          )}
        </>
      )}

      {/* BULANAN */}
      {activeTab === "bulanan" &&
        (monthlyData.length > 0 ? (
          <MonthlyMatrix data={monthlyData} />
        ) : (
          <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
            Tidak ada data untuk tahun ini.
          </div>
        ))}
    </div>
  );
}
