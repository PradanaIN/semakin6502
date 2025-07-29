import React, { useEffect, useState } from "react";
import DailyMatrix from "../DailyMatrix";
import WeeklyMatrix from "../WeeklyMatrix";
import MonthlyMatrix from "./MonthlyMatrix";
import WeeklyProgressTable from "./WeeklyProgressTable";
import Skeleton from "../../../components/ui/Skeleton";
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

  const skeletonCols =
    activeTab === "harian" ? 7 : activeTab === "mingguan" ? 4 : 12;

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        setLoading(true);
        const first = new Date(new Date().getFullYear(), monthIndex, 1)
          .toISOString()
          .slice(0, 10);
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
  }, [activeTab, monthIndex, teamId]);

  useEffect(() => {
    const fetchWeekly = async () => {
      if (!weekStarts.length || activeTab !== "mingguan") return;
      try {
        setLoading(true);
        const minggu = weekStarts[weekIndex].toISOString().slice(0, 10);
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
  }, [activeTab, weekIndex, weekStarts, teamId]);

  useEffect(() => {
    const fetchWeeklyMonth = async () => {
      if (activeTab !== "mingguan") return;
      try {
        setLoading(true);
        const first = new Date(new Date().getFullYear(), monthIndex, 1)
          .toISOString()
          .slice(0, 10);
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
  }, [activeTab, monthIndex, teamId]);

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
    return (
      <div className="overflow-auto">
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-2 border text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              {Array.from({ length: skeletonCols }).map((_, i) => (
                <th key={i} className="p-1 border">
                  <Skeleton className="h-4 w-full" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="p-2 border">
                  <Skeleton className="h-4 w-32" />
                </td>
                {Array.from({ length: skeletonCols }).map((_, j) => (
                  <td key={j} className="p-1 border">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const headings = {
    harian: "Monitoring Harian: Jumlah Laporan Pekerjaan",
    mingguan: "Monitoring Mingguan: Ringkasan Minggu",
    bulanan: "Monitoring Bulanan: Progress Tahunan",
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
        {headings[activeTab]}
      </h2>

      {activeTab === "harian" && (
        <>
          <DailyMatrix data={dailyData} />
          <Legend className="mt-2" />
        </>
      )}

      {activeTab === "mingguan" && (
        <div className="grid md:grid-cols-2 gap-4">
          <WeeklyMatrix
            data={weeklyMonthData}
            weeks={weekStarts}
            selectedWeek={weekIndex}
            onSelectWeek={() => {}}
          />
          <div>
            <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
              Ringkasan Minggu {weekIndex + 1}
            </h3>
            <WeeklyProgressTable data={weeklyData} />
          </div>
        </div>
      )}

      {activeTab === "bulanan" &&
        (monthlyData.length > 0 ? (
          <MonthlyMatrix data={monthlyData} />
        ) : (
          <div className="text-center py-4">Tidak ada data</div>
        ))}
    </div>
  );
}
