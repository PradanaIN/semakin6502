import MonitoringTabs from "../../components/dashboard/MonitoringTabs";
import StatsSummary from "../../components/dashboard/StatsSummary";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ROLES } from "../../utils/roles";
import Button from "../../components/ui/Button";

const Dashboard = () => {
  const { user } = useAuth();
  const [dailyData, setDailyData] = useState([]);
  const [weeklyList, setWeeklyList] = useState([]);
  const [weekIndex, setWeekIndex] = useState(0);
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchAllData = async () => {
      const formatISO = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      const today = new Date();
      const tanggal = formatISO(today);
      const year = today.getFullYear();
      const month = monthIndex;

      // determine start dates for each week in the month
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      const weekStarts = [];
      for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 7)) {
        weekStarts.push(new Date(d));
      }

      let currentIndex = weekStarts.findIndex((start) => {
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return today >= start && today <= end;
      });
      if (currentIndex === -1) currentIndex = 0;

      try {
        const filters = {};
        if (user?.role === ROLES.ANGGOTA) {
          filters.userId = user.id;
        }
        if (user?.role === ROLES.KETUA && user?.teamId) {
          filters.teamId = user.teamId;
        }

        const weeklyPromises = weekStarts.map((d) =>
          axios
            .get("/monitoring/mingguan", {
              params: { minggu: formatISO(d), ...filters },
            })
            .then((res) => res.data)
        );

        const [dailyRes, weeklyArray, monthlyRes] = await Promise.all([
          axios.get("/monitoring/harian", { params: { tanggal, ...filters } }),
          Promise.all(weeklyPromises),
          axios.get("/monitoring/bulanan", { params: { year: String(year), ...filters } }),
        ]);

        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        const normalized = weeklyArray.map((w, i) => {
          const [sIso, eIso] = w.tanggal.split(" - ");
          const startDate = new Date(sIso);
          const endDate = new Date(eIso);
          const displayStart = startDate < monthStart ? monthStart : startDate;
          const displayEnd = endDate > monthEnd ? monthEnd : endDate;
          const tanggal = `${formatISO(displayStart)} - ${formatISO(displayEnd)}`;
          const detail = w.detail.filter((d) => {
            const t = new Date(d.tanggal);
            return t >= monthStart && t <= monthEnd;
          });
          const totalSelesai = detail.reduce((sum, d) => sum + d.selesai, 0);
          const totalTugas = detail.reduce((sum, d) => sum + d.total, 0);
          const totalProgress = totalTugas
            ? Math.round((totalSelesai / totalTugas) * 100)
            : 0;
          return {
            ...w,
            minggu: i + 1,
            tanggal,
            detail,
            totalSelesai,
            totalTugas,
            totalProgress,
          };
        });

        setDailyData(dailyRes.data);
        setWeeklyList(normalized);
        setWeekIndex(currentIndex);
        setMonthlyData(monthlyRes.data);
      } catch (error) {
        if (error?.response && [401, 403].includes(error.response.status)) {
          setErrorMsg("Anda tidak memiliki akses untuk melihat monitoring.");
        }
        console.error("Gagal mengambil data monitoring:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user?.id, user?.role, user?.teamId, monthIndex]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Memuat data monitoring...
        </p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 dark:text-red-400">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">
        Selamat datang, {user?.nama || "Pengguna"}! 👋
      </h1>

      <StatsSummary weeklyData={weeklyList[weekIndex]} />

      <MonitoringTabs
        dailyData={dailyData}
        weeklyList={weeklyList}
        weekIndex={weekIndex}
        onWeekChange={setWeekIndex}
        monthIndex={monthIndex}
        onMonthChange={setMonthIndex}
        monthlyData={monthlyData}
      />

      <div className="bg-green-50 dark:bg-green-900 p-6 rounded-xl shadow text-center">
        <h2 className="text-xl font-semibold text-green-800 dark:text-white mb-3">
          Ayo lengkapi laporan harianmu!
        </h2>
        <Button
          variant="primary"
          className="font-semibold w-fit mx-auto"
        >
          Isi Laporan Sekarang
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
