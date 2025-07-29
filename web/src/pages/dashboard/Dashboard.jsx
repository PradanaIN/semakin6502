import MonitoringTabs from "../../components/dashboard/MonitoringTabs";
import StatsSummary from "../../components/dashboard/StatsSummary";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ROLES } from "../../utils/roles";
import Button from "../../components/ui/Button";
import { handleAxiosError } from "../../utils/alerts";
import Loading from "../../components/Loading";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [dailyData, setDailyData] = useState([]);
  const [weeklyList, setWeeklyList] = useState([]);
  const [weekIndex, setWeekIndex] = useState(0);
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasReportedToday, setHasReportedToday] = useState(false);

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
      const firstOfMonth = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      const firstMonday = new Date(firstOfMonth);
      firstMonday.setDate(
        firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7)
      );
      const weekStarts = [];
      for (
        let d = new Date(firstMonday);
        d <= monthEnd;
        d.setDate(d.getDate() + 7)
      ) {
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

        const tugasPromises = weekStarts.map((d) =>
          axios
            .get("/monitoring/penugasan/minggu", {
              params: { minggu: formatISO(d), ...filters },
            })
            .then((res) => res.data)
        );

        const [dailyRes, weeklyArray, monthlyRes, tugasArray] = await Promise.all([
          axios.get("/monitoring/harian", { params: { tanggal, ...filters } }),
          Promise.all(weeklyPromises),
          axios.get("/monitoring/bulanan", {
            params: { year: String(year), ...filters },
          }),
          Promise.all(tugasPromises),
        ]);

        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        const normalized = weeklyArray.map((w, i) => {
          const [sIso, eIso] = w.tanggal.split(" - ");
          const startDate = new Date(sIso);
          const endDate = new Date(eIso);
          const displayStart = startDate < monthStart ? monthStart : startDate;
          const displayEnd = endDate > monthEnd ? monthEnd : endDate;
          const tanggal = `${formatISO(displayStart)} - ${formatISO(
            displayEnd
          )}`;
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
            penugasan: tugasArray[i],
          };
        });

        setDailyData(dailyRes.data);
        const todayRec = dailyRes.data.find((d) => d.tanggal === tanggal);
        setHasReportedToday(!!todayRec?.adaKegiatan);
        setWeeklyList(normalized);
        setWeekIndex(currentIndex);
        setMonthlyData(monthlyRes.data);
      } catch (error) {
        if (error?.response && [401, 403].includes(error.response.status)) {
          setErrorMsg("Anda tidak memiliki akses untuk melihat monitoring.");
        }
        handleAxiosError(error, "Gagal mengambil data monitoring");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user?.id, user?.role, user?.teamId, monthIndex]);

  if (loading) {
    return <Loading fullScreen />;
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

      {!hasReportedToday && (
        <div className="bg-yellow-50 dark:bg-yellow-900 p-6 rounded-xl shadow text-center">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
            Hari ini Anda belum melakukan laporan kegiatan harian Anda!
          </h2>
          <Link to="/tugas-mingguan">
            <Button variant="primary" className="font-semibold w-fit mx-auto">
              Isi Laporan Sekarang
            </Button>
          </Link>
        </div>
      )}

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
    </div>
  );
};

export default Dashboard;
