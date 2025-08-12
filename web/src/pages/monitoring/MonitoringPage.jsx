import { useState, useEffect } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import FilterToolbar from "./components/FilterToolbar";
import TabNavigation from "./components/TabNavigation";
import TabContent from "./components/TabContent";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import { ROLES } from "../../utils/roles";
import { handleAxiosError } from "../../utils/alerts";
import dayjs from "../../utils/dayjs";

const formatWita = (iso) =>
  dayjs.utc(iso).tz("Asia/Makassar").format("DD MMM YYYY HH:mm:ss");

// eslint-disable-next-line react-refresh/only-export-components
export const getWeekStarts = (month, year) => {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const monthEnd = new Date(Date.UTC(year, month + 1, 0));
  const firstMonday = new Date(firstOfMonth);
  const offset = (1 - firstOfMonth.getUTCDay() + 7) % 7;
  firstMonday.setUTCDate(firstOfMonth.getUTCDate() + offset);

  const starts = [];
  for (let d = new Date(firstMonday); d <= monthEnd; d.setUTCDate(d.getUTCDate() + 7)) {
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

  // Ambil daftar tim jika admin/ketua/pimpinan
  useEffect(() => {
    const fetchTeams = async () => {
      if ([ROLES.ADMIN, ROLES.KETUA, ROLES.PIMPINAN].includes(user?.role)) {
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
  }, []);

  // Hitung awal minggu setiap kali bulan atau tahun berubah
  useEffect(() => {
    const starts = getWeekStarts(monthIndex, year);
    setWeekStarts(starts);
    if (weekIndex >= starts.length) setWeekIndex(0);
  }, [monthIndex, year]);

  // Reset ke minggu pertama saat bulan berubah
  useEffect(() => {
    setWeekIndex(0);
  }, [monthIndex]);

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
            userRole={user?.role}
          />
        </div>

        {/* Info terakhir diperbarui */}
        {lastUpdate && (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Terakhir diperbarui: {formatWita(lastUpdate)}
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
