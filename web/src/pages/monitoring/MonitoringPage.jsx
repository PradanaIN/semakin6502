import { useRef } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import FilterToolbar from "./components/FilterToolbar";
import TabNavigation from "./components/TabNavigation";
import TabContent from "./components/TabContent";
import Button from "../../components/ui/Button";
import { FaFilePdf } from "react-icons/fa";
import { exportMonthlyCurrentPDF, exportMonthlyYearPDF } from "./export/pdfTable";
import Legend from "../../components/ui/Legend";
import { useAuth } from "../auth/useAuth";
import formatWita from "../../utils/formatWita";
import { useMonitoringFilters } from "@/modules/monitoring/hooks/useMonitoringFilters";
import { useMonitoringTeams } from "@/modules/monitoring/hooks/useMonitoringTeams";
import { useMonitoringLastUpdate } from "@/modules/monitoring/hooks/useMonitoringLastUpdate";

export default function MonitoringPage() {
  const { user } = useAuth();
  const {
    tab,
    setTab,
    monthIndex,
    setMonthIndex,
    weekIndex,
    setWeekIndex,
    weekStarts,
    year,
    setYear,
    teamId,
    setTeamId,
    monthlyMode,
    setMonthlyMode,
  } = useMonitoringFilters();
  const { teams } = useMonitoringTeams(user?.role);
  const lastUpdate = useMonitoringLastUpdate();
  const contentRef = useRef(null);

  const titleFor = (key) =>
    key === "harian"
      ? "Daftar Laporan Harian"
      : key === "mingguan"
      ? "Capaian Mingguan Pegawai"
      : "Capaian Bulanan Pegawai";

  return (
    <div className="max-w-screen-xl mx-auto px-4 flex flex-col gap-4 pb-10">
      <TabNavigation activeTab={tab} onChange={setTab} />

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
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
