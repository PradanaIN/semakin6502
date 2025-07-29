import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FilterToolbar from "./components/FilterToolbar";
import TabNavigation from "./components/TabNavigation";
import TabContent from "./components/TabContent";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import { ROLES } from "../../utils/roles";
import { handleAxiosError } from "../../utils/alerts";

const formatWita = (iso) =>
  new Date(iso).toLocaleString("id-ID", { timeZone: "Asia/Makassar" });

export default function MonitoringPage() {
  const [tab, setTab] = useState("harian");
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [weekIndex, setWeekIndex] = useState(0);
  const [weekStarts, setWeekStarts] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState([]);
  const [lastUpdate, setLastUpdate] = useState("");

  const headings = {
    harian: "Daftar Laporan Harian",
    mingguan: "Capaian Mingguan Pegawai",
    bulanan: "Capaian Bulanan Pegawai",
  };

  const { user } = useAuth();

  // Fetch daftar tim jika admin/ketua
  useEffect(() => {
    const fetchTeams = async () => {
      if (user?.role === ROLES.ADMIN || user?.role === ROLES.KETUA) {
        try {
          const res = await axios.get("/teams");
          setTeams(res.data);
        } catch (err) {
          handleAxiosError(err, "Gagal mengambil tim");
        }
      }
    };
    fetchTeams();
  }, [user?.role]);

  useEffect(() => {
    const getUpdate = async () => {
      try {
        const res = await axios.get('/monitoring/last-update');
        setLastUpdate(res.data.lastUpdate);
      } catch {}
    };
    getUpdate();
  }, []);

  // Generate minggu setiap bulan berubah
  useEffect(() => {
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
  }, [monthIndex, year]);

  return (
    <div className="space-y-4">
      <TabNavigation activeTab={tab} onChange={setTab} />

      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            {headings[tab]}
          </h2>
          <FilterToolbar
            tab={tab}
            monthIndex={monthIndex}
            setMonthIndex={setMonthIndex}
            weekIndex={weekIndex}
            setWeekIndex={setWeekIndex}
            weekStarts={weekStarts}
            year={year}
            setYear={setYear}
            teamId={teamId}
            setTeamId={setTeamId}
            teams={teams}
            userRole={user?.role}
          />
        </div>
        {lastUpdate && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Data terakhir diperbarui: {formatWita(lastUpdate)}
          </p>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <TabContent
              activeTab={tab}
              monthIndex={monthIndex}
              weekIndex={weekIndex}
              weekStarts={weekStarts}
              year={year}
              teamId={teamId}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
