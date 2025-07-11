
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

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
          axios.get("/monitoring/harian"),
          axios.get("/monitoring/mingguan"),
          axios.get("/monitoring/bulanan"),
        ]);

        setDailyData(dailyRes.data);
        setWeeklyData(weeklyRes.data);
        setMonthlyData(monthlyRes.data);
      } catch (error) {
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
