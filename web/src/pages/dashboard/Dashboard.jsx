import MonitoringTabs from "../../components/dashboard/MonitoringTabs";
import StatsSummary from "../../components/dashboard/StatsSummary";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const [dailyData, setDailyData] = useState([]);
  const [weeklyList, setWeeklyList] = useState([]);
  const [weekIndex, setWeekIndex] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchAllData = async () => {
      const today = new Date();
      const tanggal = today.toISOString().split("T")[0];
      const year = today.getFullYear();
      const month = today.getMonth();

      // determine start dates for each week in the month
      const firstOfMonth = new Date(year, month, 1);
      const firstMonday = new Date(firstOfMonth);
      firstMonday.setDate(firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7));
      const weekStarts = [];
      for (let i = 0; i < 6; i++) {
        const d = new Date(firstMonday);
        d.setDate(firstMonday.getDate() + i * 7);
        if (i > 0 && d.getMonth() !== month && d.getDate() > 7) break;
        weekStarts.push(d);
      }

      let currentIndex = 0;
      weekStarts.forEach((w, idx) => {
        const end = new Date(w);
        end.setDate(w.getDate() + 6);
        if (today >= w && today <= end) currentIndex = idx;
      });

      try {
        const filters = {};
        if (user?.role === "anggota") {
          filters.userId = user.id;
        }
        if (user?.role === "ketua" && user?.teamId) {
          filters.teamId = user.teamId;
        }

        const weeklyPromises = weekStarts.map((d) =>
          axios
            .get("/monitoring/mingguan", {
              params: { minggu: d.toISOString().split("T")[0], ...filters },
            })
            .then((res) => res.data)
        );

        const [dailyRes, weeklyArray, monthlyRes] = await Promise.all([
          axios.get("/monitoring/harian", { params: { tanggal, ...filters } }),
          Promise.all(weeklyPromises),
          axios.get("/monitoring/bulanan", { params: { bulan: String(year), ...filters } }),
        ]);

        const mingguKe = Math.ceil(today.getDate() / 7);
        const weekAssignments = (penRes.data || []).filter(
          (p) => parseInt(p.minggu, 10) === mingguKe
        );
        const selesaiCount = weekAssignments.filter((p) =>
          String(p.status).toLowerCase().includes("selesai")
        ).length;

        const weeklyDataFixed = {
          ...weeklyRes.data,
          totalTugas: weekAssignments.length,
          totalSelesai: selesaiCount,
        };

        setDailyData(dailyRes.data);
        setWeeklyList(weeklyArray);
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
  }, [user?.id, user?.role, user?.teamId]);

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
        monthlyData={monthlyData}
      />

      <div className="bg-green-50 dark:bg-green-900 p-6 rounded-xl shadow text-center">
        <h2 className="text-xl font-semibold text-green-800 dark:text-white mb-3">
          Ayo lengkapi laporan harianmu!
        </h2>
        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg w-fit mx-auto">
          Isi Laporan Sekarang
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
