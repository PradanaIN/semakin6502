import { useState, useEffect } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import FilterToolbar from "./components/FilterToolbar";
import TabNavigation from "./components/TabNavigation";
import TabContent from "./components/TabContent";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import { handleAxiosError } from "../../utils/alerts";

const formatWita = (iso) => {
  const date = new Date(iso);
  const formattedDate = date.toLocaleDateString("id-ID", {
    timeZone: "Asia/Makassar",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("id-ID", {
    timeZone: "Asia/Makassar",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return `${formattedDate} pukul ${formattedTime} WITA`;
};

// eslint-disable-next-line react-refresh/only-export-components
export const getWeekStarts = (month, year) => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const starts = [];

  const start = new Date(first);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  for (let d = new Date(start); d <= last; d.setDate(d.getDate() + 7)) {
    starts.push(new Date(d));
  }

  return starts;
};

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
    harian: "📅 Daftar Laporan Harian",
    mingguan: "📈 Capaian Mingguan Pegawai",
    bulanan: "📊 Capaian Bulanan Pegawai",
  };

  const { user } = useAuth();

  // Ambil semua daftar tim untuk filter
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get("/teams/all");
        setTeams(res.data);
      } catch (err) {
        handleAxiosError(err, "Gagal mengambil tim");
      }
    };
    fetchTeams();
  }, [user?.role]);

  // Ambil waktu update terakhir
  useEffect(() => {
    const getUpdate = async () => {
      try {
        const res = await axios.get("/monitoring/last-update");
        setLastUpdate(res.data.lastUpdate);
      } catch {
        // abaikan error
      }
    };
    getUpdate();
    const id = setInterval(getUpdate, 60000);
    return () => clearInterval(id);
  }, []);

  // Hitung awal minggu setiap kali bulan atau tahun berubah
  useEffect(() => {
    const starts = getWeekStarts(monthIndex, year);
    setWeekStarts(starts);

    const today = new Date();
    const idx = starts.findIndex((start) => {
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return today >= start && today < end;
    });

    if (
      monthIndex === today.getMonth() &&
      year === today.getFullYear() &&
      idx !== -1
    ) {
      setWeekIndex(idx);
    } else {
      setWeekIndex(0);
    }
  }, [monthIndex, year]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 flex flex-col gap-4 pb-10">
      <TabNavigation activeTab={tab} onChange={setTab} />

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
        {/* Heading + Filter */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
              {headings[tab]}
            </h2>
          </div>
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
          />
        </div>

        {/* Info terakhir diperbarui */}
        {lastUpdate && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Data terakhir diperbarui: <strong>{formatWita(lastUpdate)}</strong>
          </p>
        )}

        {/* Isi tab */}
        <AnimatePresence mode="wait">
          <Motion.div
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
          </Motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
