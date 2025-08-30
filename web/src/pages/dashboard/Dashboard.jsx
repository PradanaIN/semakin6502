import MonitoringTabs from "./components/MonitoringTabs";
import StatsSummary from "./components/StatsSummary";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import { useEffect, useState, useCallback, useRef } from "react";
import { ROLES } from "../../utils/roles";
import Button from "../../components/ui/Button";
import { handleAxiosError } from "../../utils/alerts";
import Loading from "../../components/Loading";
import { STATUS } from "../../utils/status";
import { Link } from "react-router-dom";
import { getHolidays } from "../../utils/holidays";

const formatISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getWeekStarts = (month, year) => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const weeks = [];

  const start = new Date(first);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  for (let d = new Date(start); d <= last; d.setDate(d.getDate() + 7)) {
    weeks.push(new Date(d));
  }

  return weeks;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [dailyData, setDailyData] = useState([]);
  const [weeklyList, setWeeklyList] = useState([]);
  const [weeklySelfList, setWeeklySelfList] = useState([]);
  const [weekIndex, setWeekIndex] = useState(0);
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasReportedToday, setHasReportedToday] = useState(false);
  const [partialError, setPartialError] = useState(false);
  const [laporanCountToday, setLaporanCountToday] = useState(null);
  const [isCurrentView, setIsCurrentView] = useState(true);
  const lastPeriodRef = useRef({ monthIndex: -1, year: -1 });

  const handleMonthChange = useCallback((value) => {
    setWeekIndex(0);
    setMonthIndex((prev) => (prev !== value ? value : prev));
  }, []);

  const handleWeekChange = useCallback((value) => {
    setWeekIndex((prev) => (prev !== value ? value : prev));
  }, []);

  const handleYearChange = useCallback((value) => {
    setWeekIndex(0);
    setYear((prev) => (prev !== value ? value : prev));
  }, []);

  useEffect(() => {
    setWeeklyList([]);
    const fetchAllData = async () => {
      const today = new Date();
      const tanggal = formatISO(today);
      const month = monthIndex;
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);

      const weekStarts = getWeekStarts(month, year);

      let currentIndex = weekStarts.findIndex((start) => {
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return today >= start && today <= end;
      });
      if (currentIndex === -1) currentIndex = 0;
      const viewIsCurrent = month === today.getMonth() && year === today.getFullYear() && weekIndex === currentIndex;
      setIsCurrentView(viewIsCurrent);

      try {
        const filters = {};
        if (user?.role === ROLES.ANGGOTA) filters.userId = user.id;
        if (user?.role === ROLES.KETUA && user?.teamId)
          filters.teamId = user.teamId;

        // Reduce initial load: fetch only current week's data (others lazy/fallback)
        // Only fetch penugasan per minggu (current week only); we will synthesize weekly detail from dailyData
        const tugasPromises = [
          axios
            .get("/monitoring/penugasan/minggu", {
              params: { minggu: formatISO(weekStarts[currentIndex]), ...filters },
            })
            .then((res) => res.data),
        ];

        // Build self-only weekly data regardless of role (for personal summary)
        const tugasSelfPromises = [
          axios
            .get("/monitoring/penugasan/minggu", {
              params: { minggu: formatISO(weekStarts[currentIndex]), userId: user?.id },
            })
            .then((res) => res.data),
        ];

        const tambahanReq =
          user?.role === ROLES.ADMIN || user?.role === ROLES.PIMPINAN
            ? axios.get("/tugas-tambahan/all", {
                params: { teamId: filters.teamId || undefined },
              })
            : axios.get("/tugas-tambahan", {
                params: { teamId: filters.teamId || undefined },
              });

        const [dailyRes, /*weeklyArrayRes*/, monthlyRes, tugasArrayRes, tambahanRes, /*weeklySelfArrayRes*/, tugasSelfArrayRes, dailySelfRes, monthlySelfRes] =
          await Promise.allSettled([
            axios.get("/monitoring/harian", {
              params: { tanggal: formatISO(monthStart), ...filters },
            }),
            // placeholder to keep indexes aligned
            Promise.resolve([]),
            axios.get("/monitoring/bulanan", {
              params: { year: String(year), ...filters },
            }),
            Promise.allSettled(tugasPromises),
            tambahanReq,
            Promise.resolve([]),
            Promise.allSettled(tugasSelfPromises),
            axios.get("/monitoring/harian", {
              params: { tanggal: formatISO(monthStart), userId: user?.id },
            }),
            axios.get("/monitoring/bulanan", {
              params: { year: String(year), userId: user?.id },
            }),
          ]);

        let partial = false;

        const dailySource = dailySelfRes.status === "fulfilled" ? dailySelfRes : dailyRes;
        let dailyForWeekLocal = [];
        if (dailySource.status === "fulfilled") {
          const apiDaily = Array.isArray(dailySource.value.data)
            ? dailySource.value.data.filter(
                (d) => d.tanggal && !isNaN(new Date(d.tanggal))
              )
            : [];

          const apiMap = apiDaily.reduce((acc, cur) => {
            // Normalize to local YYYY-MM-DD to match formatISO used below
            const key = formatISO(new Date(cur.tanggal));
            acc[key] = { ...cur, tanggal: key };
            return acc;
          }, {});

          const normalized = [];
          for (
            let d = new Date(monthStart);
            d <= monthEnd;
            d.setDate(d.getDate() + 1)
          ) {
            const tgl = formatISO(new Date(d));
            normalized.push(
              apiMap[tgl] || { adaKegiatan: false, tanggal: tgl }
            );
          }

          setDailyData(normalized);
          dailyForWeekLocal = normalized;
          setHasReportedToday(
            !!normalized.find((d) => d.tanggal === tanggal)?.adaKegiatan
          );
        } else {
          partial = true;
        }

        // Prepare containers aligned with weekStarts length
        // We won't use backend weekly detail to avoid rate-limit; we'll synthesize from dailyData for display

        let tugasValues = [];
        if (tugasArrayRes.status === "fulfilled") {
          tugasValues = Array.from({ length: weekStarts.length }, (_, i) =>
            i === currentIndex ? tugasArrayRes.value[0] : { status: "fulfilled", value: {} }
          );
          if (tugasArrayRes.value.some((r) => r.status === "rejected"))
            partial = true;
        } else {
          partial = true;
        }

        // No self weekly detail either
        let weeklySelfValues = [];
        let tugasSelfValues = [];
        if (tugasSelfArrayRes.status === "fulfilled") {
          tugasSelfValues = Array.from({ length: weekStarts.length }, (_, i) =>
            i === currentIndex ? tugasSelfArrayRes.value[0] : { status: "fulfilled", value: {} }
          );
          if (tugasSelfArrayRes.value.some((r) => r.status === "rejected"))
            partial = true;
        } else {
          partial = true;
        }

        // Prepare tambahan tasks (client-side aggregate by week)
        const tambahanItems =
          tambahanRes.status === "fulfilled" && Array.isArray(tambahanRes.value.data)
            ? tambahanRes.value.data
            : [];

        const normalizedWeeks = weekStarts.map((ws, i) => {
          const t =
            tugasValues[i] && tugasValues[i].status === "fulfilled"
              ? tugasValues[i].value
              : {};

          // Compute tambahan stats for this week window
          const weekStart = new Date(weekStarts[i]);
          const weekEnd = new Date(weekStarts[i]);
          weekEnd.setDate(weekStart.getDate() + 6);
          const tambahanInWeek = tambahanItems.filter((it) => {
            if (!it?.tanggal) return false;
            const d = new Date(it.tanggal);
            return d >= monthStart && d <= monthEnd && d >= weekStart && d <= weekEnd;
          });
          const tambahanTotal = tambahanInWeek.length;
          const tambahanSelesai = tambahanInWeek.filter(
            (it) => it.status === STATUS.SELESAI_DIKERJAKAN
          ).length;
          const tambahanBelum = Math.max(tambahanTotal - tambahanSelesai, 0);

          // Synthesize weekly detail list from dailyData for display (binary ada laporan)
          const displayStart = new Date(weekStart < monthStart ? monthStart : weekStart);
          const displayEnd = new Date(weekEnd > monthEnd ? monthEnd : weekEnd);
          const tanggal = `${formatISO(displayStart)} - ${formatISO(displayEnd)}`;
          const detail = [];
          for (let d = new Date(displayStart); d <= displayEnd; d.setDate(d.getDate() + 1)) {
            const tgl = formatISO(new Date(d));
            const daily = (dailyForWeekLocal || []).find((x) => x.tanggal === tgl);
            const hari = d.toLocaleDateString("id-ID", { weekday: "long" });
            const adaKegiatan = !!daily?.adaKegiatan;
            detail.push({ tanggal: tgl, hari, total: adaKegiatan ? 1 : 0, selesai: 0, persen: adaKegiatan ? 100 : 0, adaKegiatan });
          }
          
          // Prefer penugasan aggregate counts for denominator/numerator
          const penTotal = Number(t?.total ?? t?.totalTugas ?? 0) || 0;
          const penSelesai = Number(t?.selesai ?? t?.done ?? 0) || 0;
          // Fallback to detail sums only if penugasan data unavailable
          const baseSelesai = penTotal || penSelesai ? penSelesai : detail.reduce((sum, d) => sum + (d.selesai || 0), 0);
          const baseTotal = penTotal || penSelesai ? penTotal : detail.reduce((sum, d) => sum + (d.total || 0), 0);
          const totalSelesai = baseSelesai + tambahanSelesai;
          const totalTugas = baseTotal + tambahanTotal;
          const totalProgress = totalTugas
            ? Math.round((totalSelesai / totalTugas) * 100)
            : 0;

          return {
            minggu: i + 1,
            tanggal,
            detail,
            totalSelesai,
            totalTugas,
            totalProgress,
            penugasan: t,
            tambahan: {
              total: tambahanTotal,
              selesai: tambahanSelesai,
              belum: tambahanBelum,
            },
          };
        });

        setWeeklyList(normalizedWeeks);
        const periodChanged =
          lastPeriodRef.current.monthIndex !== month || lastPeriodRef.current.year !== year;
        if (periodChanged) {
          const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();
          const defaultIndex = isCurrentMonth ? currentIndex : 0; // current month -> current week; past/future -> week 1
          // On period change, always set to defaultIndex; user changes later will be preserved until next period change
          setWeekIndex(defaultIndex);
          lastPeriodRef.current = { monthIndex: month, year };
        }

        // Compute personal-only normalized weeks for summary boxes
        const getOwnerId = (it) =>
          it?.userId ?? it?.pegawaiId ?? it?.user?.id ?? it?.pegawai?.id ?? it?.id ?? null;
        const normalizedSelfWeeks = weeklySelfValues.map((wRes, i) => {
          const w = wRes.status === "fulfilled" ? wRes.value : null;
          const t =
            tugasSelfValues[i] && tugasSelfValues[i].status === "fulfilled"
              ? tugasSelfValues[i].value
              : {};

          const weekStart = new Date(weekStarts[i]);
          const weekEnd = new Date(weekStarts[i]);
          weekEnd.setDate(weekStart.getDate() + 6);
          const tambahanInWeek = (Array.isArray(tambahanItems) ? tambahanItems : []).filter(
            (it) => {
              if (!it?.tanggal) return false;
              const d = new Date(it.tanggal);
              const inRange = d >= monthStart && d <= monthEnd && d >= weekStart && d <= weekEnd;
              const owner = getOwnerId(it);
              const isMine = owner != null && user?.id != null && String(owner) === String(user.id);
              return inRange && isMine;
            }
          );
          const tambahanTotal = tambahanInWeek.length;
          const tambahanSelesai = tambahanInWeek.filter(
            (it) => it.status === STATUS.SELESAI_DIKERJAKAN
          ).length;
          const tambahanBelum = Math.max(tambahanTotal - tambahanSelesai, 0);

          if (!w) {
            const penTotal = Number(t?.total ?? t?.totalTugas ?? 0) || 0;
            const penSelesai = Number(t?.selesai ?? t?.done ?? 0) || 0;
            const totalSelesai = penSelesai + tambahanSelesai;
            const totalTugas = penTotal + tambahanTotal;
            const totalProgress = totalTugas
              ? Math.round((totalSelesai / totalTugas) * 100)
              : 0;
            return {
              minggu: i + 1,
              tanggal: "-",
              detail: [],
              totalSelesai,
              totalTugas,
              totalProgress,
              penugasan: t,
              tambahan: {
                total: tambahanTotal,
                selesai: tambahanSelesai,
                belum: tambahanBelum,
              },
            };
          }

          const [sIso, eIso] = w.tanggal.split(" - ");
          const startDate = new Date(sIso);
          const endDate = new Date(eIso);
          const displayStart = startDate < monthStart ? monthStart : startDate;
          const displayEnd = endDate > monthEnd ? monthEnd : endDate;
          const tanggalRange = `${formatISO(displayStart)} - ${formatISO(displayEnd)}`;

          const detail = w.detail.filter((d) => {
            const tgl = new Date(d.tanggal);
            return tgl >= monthStart && tgl <= monthEnd;
          });

          const penTotal2 = Number(t?.total ?? t?.totalTugas ?? 0) || 0;
          const penSelesai2 = Number(t?.selesai ?? t?.done ?? 0) || 0;
          const baseSelesai2 = penTotal2 || penSelesai2 ? penSelesai2 : detail.reduce((sum, d) => sum + (d.selesai || 0), 0);
          const baseTotal2 = penTotal2 || penSelesai2 ? penTotal2 : detail.reduce((sum, d) => sum + (d.total || 0), 0);
          const totalSelesai = baseSelesai2 + tambahanSelesai;
          const totalTugas = baseTotal2 + tambahanTotal;
          const totalProgress = totalTugas
            ? Math.round((totalSelesai / totalTugas) * 100)
            : 0;

          return {
            ...w,
            minggu: i + 1,
            tanggal: tanggalRange,
            detail,
            totalSelesai,
            totalTugas,
            totalProgress,
            penugasan: t,
            tambahan: {
              total: tambahanTotal,
              selesai: tambahanSelesai,
              belum: tambahanBelum,
            },
          };
        });
        setWeeklySelfList(normalizedSelfWeeks);

        // Calculate count of laporan harian created today (Sedang/Selesai) for current user (only for current view)
        try {
          if (user?.id && viewIsCurrent) {
            // Lightweight: fetch weekly summary (current week) and read today's detail counts
            const mingguStart = formatISO(weekStarts[currentIndex] || new Date());
            let todayCount = 0;
            try {
              const w = await axios.get("/monitoring/mingguan", {
                params: { minggu: mingguStart, userId: user.id },
              });
              const det = Array.isArray(w.data?.detail) ? w.data.detail : [];
              const row = det.find((d) => formatISO(new Date(d.tanggal)) === tanggal);
              if (row) {
                const selesai = Number(row.selesai || 0);
                const total = Number(row.total || 0);
                const belum = Number(row.belum || 0);
                const sedang = Number((row.sedang ?? row.proses ?? Math.max(total - selesai - belum, 0)) || 0);
                todayCount = selesai + sedang;
              }
            } catch {
              todayCount = 0;
            }
            setLaporanCountToday(todayCount);
          } else {
            setLaporanCountToday(null);
          }
        } catch {
          // ignore errors; fallback to weekly summary
          setLaporanCountToday(null);
        }

        // Monthly: use backend monthly data, then override current month with average of current month's weekly
        const monthlySource = monthlySelfRes.status === "fulfilled" ? monthlySelfRes : monthlyRes;
        const labels = [
          "Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"
        ];
        if (monthlySource.status === "fulfilled") {
          const raw = Array.isArray(monthlySource.value.data) ? monthlySource.value.data : [];
          // Normalize backend monthly: it may be an array of numbers, or array of { bulan, persen }
          const map = new Map();
          raw.forEach((it, idx) => {
            if (typeof it === "number") map.set(labels[idx], Number(it) || 0);
            else if (it && typeof it === "object") {
              const name = it.bulan || labels[idx];
              const val = Number(it.persen ?? it.value ?? 0) || 0;
              map.set(name, val);
            }
          });
          const base = labels.map((label) => ({ bulan: label, persen: map.get(label) ?? 0 }));
          // Override current month with normalizedWeeks average
          const weeksArr = Array.isArray(normalizedWeeks) ? normalizedWeeks : [];
          if (weeksArr.length) {
            const sumPerc = weeksArr.reduce((s, w) => s + (Number(w?.totalProgress) || 0), 0);
            const denom = weeksArr.length;
            const avg = denom ? Math.round(sumPerc / denom) : 0;
            base[monthIndex] = { bulan: labels[monthIndex], persen: avg };
          }
          setMonthlyData(base);
        } else {
          // No backend monthly; compute from weeks only (fallback)
          const weeksArr = Array.isArray(normalizedWeeks) ? normalizedWeeks : [];
          const fallback = labels.map((label, i) => {
            // If current selected month, average from normalizedWeeks; else 0
            if (i === monthIndex && weeksArr.length) {
              const sumPerc = weeksArr.reduce((s, w) => s + (Number(w?.totalProgress) || 0), 0);
              const denom = weeksArr.length;
              const avg = denom ? Math.round(sumPerc / denom) : 0;
              return { bulan: label, persen: avg };
            }
            return { bulan: label, persen: 0 };
          });
          setMonthlyData(fallback);
          partial = true;
        }

        if (partial) setPartialError(true);
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
  }, [user?.id, user?.role, user?.teamId, monthIndex, year, weekIndex]);

  if (loading) return <Loading fullScreen />;
  if (errorMsg)
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 dark:text-red-400">{errorMsg}</p>
      </div>
    );
  
  // Determine whether to show the daily reminder banner (only on working days of current period)
  const todayLocal = new Date();
  const isWeekendDay = todayLocal.getDay() === 0 || todayLocal.getDay() === 6;
  const isHolidayDay = getHolidays(todayLocal.getFullYear()).includes(formatISO(todayLocal));
  const shouldShowBanner = isCurrentView && !hasReportedToday && !isWeekendDay && !isHolidayDay;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">
        Selamat datang, {user?.nama || "Pengguna"}! 👋
      </h1>

      {shouldShowBanner && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 p-6 rounded-xl shadow text-center animate-pulse">
          <h2 className="text-lg sm:text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Anda belum mengisi laporan kegiatan harian hari ini.
          </h2>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
            Ayo segera lengkapi agar progres Anda tetap tercatat.
          </p>
          <Link to="/tugas-mingguan">
            <Button variant="primary" className="font-semibold w-fit mx-auto">
              Isi Laporan Sekarang
            </Button>
          </Link>
        </div>
      )}

      {partialError && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 p-4 rounded-xl text-red-800 dark:text-red-200">
          Sebagian data gagal dimuat. Beberapa informasi mungkin tidak lengkap.
        </div>
      )}

      <StatsSummary
        weeklyData={weeklySelfList[weekIndex] || weeklyList[weekIndex]}
        reportedToday={isCurrentView && hasReportedToday}
        countOverride={isCurrentView ? laporanCountToday : null}
        activeDate={isCurrentView ? formatISO(new Date()) : null}
      />

      <MonitoringTabs
        dailyData={dailyData}
        weeklyList={weeklySelfList.length ? weeklySelfList : weeklyList}
        weekIndex={weekIndex}
        onWeekChange={handleWeekChange}
        monthIndex={monthIndex}
        onMonthChange={handleMonthChange}
        monthlyData={monthlyData}
        year={year}
        onYearChange={handleYearChange}
      />
    </div>
  );
};

export default Dashboard;
