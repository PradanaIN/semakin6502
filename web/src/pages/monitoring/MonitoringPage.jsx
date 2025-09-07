import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import FilterToolbar from "./components/FilterToolbar";
import TabNavigation from "./components/TabNavigation";
import TabContent from "./components/TabContent";
import Button from "../../components/ui/Button";
import { FaFilePdf } from "react-icons/fa";
import { exportMonthlyCurrentPDF, exportMonthlyYearPDF } from "./export/pdfTable";
import Legend from "../../components/ui/Legend";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import { handleAxiosError, showWarning } from "../../utils/alerts";
import formatWita from "../../utils/formatWita";

// formatWita dipindahkan ke util bersama

// No separate small-screen formatter; keep full text on all sizes

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
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initFromQuery = useRef(false);
  const [tab, setTab] = useState("harian");
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [weekIndex, setWeekIndex] = useState(0);
  const [weekStarts, setWeekStarts] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState([]);
  const [lastUpdate, setLastUpdate] = useState("");
  const [monthlyMode, setMonthlyMode] = useState("current"); // 'current' | 'year'
  const contentRef = useRef(null);

  // Judul yang konsisten untuk setiap tab
  const titleFor = (key) =>
    key === "harian"
      ? "Daftar Laporan Harian"
      : key === "mingguan"
      ? "Capaian Mingguan Pegawai"
      : "Capaian Bulanan Pegawai";


  // Ambil semua daftar tim untuk filter
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get("/teams/all");
        const data = res?.data;
        if (
          typeof data === "string" && data.trim().startsWith("<")
        ) {
          console.warn("Unexpected HTML response for teams", data);
          showWarning("Gagal mengambil tim", "Respon tidak valid");
        } else if (!Array.isArray(data)) {
          console.warn("Unexpected teams response", data);
          showWarning("Gagal mengambil tim", "Data tim tidak valid");
        }
        setTeams(Array.isArray(data) ? data : []);
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
        // Use server-provided fetchedAt for true load time; fallbacks retained
        if (res?.data?.fetchedAt) {
          setLastUpdate(res.data.fetchedAt);
        } else if (res?.headers?.date) {
          setLastUpdate(new Date(res.headers.date).toISOString());
        } else if (res?.data?.lastUpdate) {
          setLastUpdate(res.data.lastUpdate);
        } else {
          setLastUpdate(new Date().toISOString());
        }
      } catch {
        // abaikan error
      }
    };
    getUpdate();
    const id = setInterval(getUpdate, 60000);
    return () => clearInterval(id);
  }, []);

  // Inisialisasi dari query string (tab, month, week, year)
  useEffect(() => {
    if (initFromQuery.current) return;
    const params = new URLSearchParams(location.search);
    const qTab = params.get("tab");
    const qMonth = parseInt(params.get("month"), 10);
    const qYear = parseInt(params.get("year"), 10);
    if (["harian", "mingguan", "bulanan"].includes(qTab)) setTab(qTab);
    if (!isNaN(qYear)) setYear(qYear);
    if (!isNaN(qMonth) && qMonth >= 1 && qMonth <= 12) setMonthIndex(qMonth - 1);
    // weekIndex akan disetel setelah weekStarts dihitung di efek berikutnya
    initFromQuery.current = true;
  }, [location.search]);

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

    // Jika query memberi week, gunakan itu; jika tidak, pakai default sbb
    const params = new URLSearchParams(location.search);
    const qWeek = parseInt(params.get("week"), 10);
    if (tab === "mingguan" && !isNaN(qWeek) && qWeek >= 1 && qWeek <= starts.length) {
      setWeekIndex(qWeek - 1);
    } else {
      if (
        monthIndex === today.getMonth() &&
        year === today.getFullYear() &&
        idx !== -1
      ) {
        setWeekIndex(idx);
      } else {
        setWeekIndex(0);
      }
    }
  }, [monthIndex, year, tab, location.search]);

  // Saat pindah ke tab mingguan, set default minggu ke minggu berjalan (jika bulan/tahun saat ini), selain itu ke minggu 1
  useEffect(() => {
    if (tab !== "mingguan" || weekStarts.length === 0) return;
    const today = new Date();
    const idx = weekStarts.findIndex((start) => {
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return today >= start && today < end;
    });
    if (monthIndex === today.getMonth() && year === today.getFullYear() && idx !== -1) {
      setWeekIndex(idx);
    }
  }, [tab, weekStarts, monthIndex, year]);

  // Sinkronisasi querystring saat state berubah agar bisa dibagikan
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tab", tab);
    params.set("month", String(monthIndex + 1));
    params.set("year", String(year));
    if (tab === "mingguan") {
      params.set("week", String(weekIndex + 1));
    }
    if (teamId) {
      params.set("team", teamId);
    }
    navigate({ pathname: location.pathname, search: `?${params.toString()}` }, { replace: true });
  }, [tab, monthIndex, weekIndex, year, teamId, navigate, location.pathname]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 flex flex-col gap-4 pb-10">
      <TabNavigation activeTab={tab} onChange={setTab} />

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
        {/* Heading + Filter (sticky) */}
        <div
          className="sticky top-0 z-30 -mx-6 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur rounded-t-xl border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between md:items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
              {titleFor(tab)}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <FilterToolbar
              tab={tab}
              monthlyMode={monthlyMode}
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
            {tab === "bulanan" && (
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    if (monthlyMode === "current") {
                      await exportMonthlyCurrentPDF({ year, month: monthIndex + 1, teamId });
                    } else {
                      await exportMonthlyYearPDF({ year, teamId });
                    }
                  } catch (e) {
                    console.error("Export failed", e);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700"
              >
                <span className="inline-flex items-center gap-2">
                  <FaFilePdf className="w-4 h-4" /> .pdf
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Legend kiri + timestamp kanan khusus tab Harian */}
        {tab === "harian" && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Legend className="mb-3 justify-start" />
            {lastUpdate && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Data diambil pada <strong>{formatWita(lastUpdate)}</strong>
              </p>
            )}
          </div>
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
              monthlyMode={monthlyMode}
              onMonthlyModeChange={setMonthlyMode}
              contentRef={contentRef}
              lastUpdateText={lastUpdate ? `Data diambil pada ${formatWita(lastUpdate)}` : ""}
              lastUpdateIso={lastUpdate}
            />
          </Motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
