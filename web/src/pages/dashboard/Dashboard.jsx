
import MonitoringTabs from "../../components/dashboard/MonitoringTabs";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchAllData = async () => {
      const today = new Date();
      const tanggal = today.toISOString().split("T")[0];
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      const minggu = startOfWeek.toISOString().split("T")[0];
      const bulan = today.toISOString().slice(0, 7);

      try {
        const filters = {};
        if (user?.role === "anggota") {
          filters.userId = user.id;
        }
        if (user?.role === "ketua" && user?.teamId) {
          filters.teamId = user.teamId;
        }

        const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
          axios.get("/monitoring/harian", { params: { tanggal, ...filters } }),
          axios.get("/monitoring/mingguan", { params: { minggu, ...filters } }),
          axios.get("/monitoring/bulanan", { params: { bulan, ...filters } }),
        ]);

        setDailyData(dailyRes.data);
        setWeeklyData(weeklyRes.data);
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
  }, []);

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
        Selamat datang, {user?.nama || "Pengguna"} 👋
      </h1>

      <MonitoringTabs
        dailyData={dailyData}
        weeklyData={weeklyData}
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
