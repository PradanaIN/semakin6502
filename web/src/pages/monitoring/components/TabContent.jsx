import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DailyMatrix from "../DailyMatrix";
import WeeklyMatrix from "../WeeklyMatrix";
import MonthlyMatrix from "./MonthlyMatrix";
import WeeklyProgressTable from "./WeeklyProgressTable";
import TableSkeleton from "../../../components/ui/TableSkeleton";
import DailyMatrixSkeleton from "./DailyMatrixSkeleton";
import axios from "axios";
import { getWeekOfMonth } from "../../../utils/dateUtils";
import { handleAxiosError } from "../../../utils/alerts";
import { useAuth } from "../../auth/useAuth";
import { ROLES } from "../../../utils/roles";
import { STATUS } from "../../../utils/status";
import formatWita from "../../../utils/formatWita";

export default function TabContent({
  activeTab,
  monthIndex,
  weekIndex,
  weekStarts,
  year,
  teamId = "",
  monthlyMode: monthlyModeProp,
  onMonthlyModeChange,
  contentRef,
  lastUpdateText = "",
  lastUpdateIso = "",
}) {
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [loadingWeeklyMonth, setLoadingWeeklyMonth] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [dailyData, setDailyData] = useState([]);
  const [weeklyMonthData, setWeeklyMonthData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyMonthView, setWeeklyMonthView] = useState([]);
  const [monthlyViewData, setMonthlyViewData] = useState([]);
  const [monthlyCurrentData, setMonthlyCurrentData] = useState([]);
  const [loadingMonthlyCurrent, setLoadingMonthlyCurrent] = useState(false);
  const [monthlyModeState, setMonthlyModeState] = useState("current");
  const [weeklyMode, setWeeklyMode] = useState("summary");
  const EXCLUDED_NAMES = useMemo(() => ["Admin Utama", "Yuda Agus Irianto"], []);
  const { user } = useAuth();
  const [tambahanItems, setTambahanItems] = useState([]);

  // Controlled monthlyMode support (dideklarasikan SEBELUM dipakai di efek)
  const monthlyMode = monthlyModeProp ?? monthlyModeState;
  const setMonthlyMode = useCallback(
    (val) => {
      if (monthlyModeProp === undefined) {
        setMonthlyModeState(val);
      }
      if (onMonthlyModeChange) onMonthlyModeChange(val);
    },
    [monthlyModeProp, onMonthlyModeChange]
  );

  // Gunakan ref agar efek reset tidak tergantung pada identitas fungsi
  const setMonthlyModeRef = useRef(setMonthlyMode);
  useEffect(() => {
    setMonthlyModeRef.current = setMonthlyMode;
  }, [setMonthlyMode]);

  const excludeUsers = useCallback(
    (arr) =>
      Array.isArray(arr)
        ? arr.filter((u) => !EXCLUDED_NAMES.includes(u?.nama))
        : [],
    [EXCLUDED_NAMES]
  );

  useEffect(() => {
    if (activeTab === "mingguan") setWeeklyMode("summary");
    if (activeTab === "bulanan") setMonthlyModeRef.current("current");
  }, [activeTab]);

  // Fetch Tugas Tambahan for current month/year/team
  useEffect(() => {
    const fetchTambahan = async () => {
      try {
        const endpoint =
          user?.role === ROLES.ADMIN ||
          user?.role === ROLES.PIMPINAN ||
          user?.role === ROLES.KETUA
            ? "/tugas-tambahan/all"
            : "/tugas-tambahan";
        const res = await axios.get(endpoint, {
          params: { teamId: teamId || undefined },
        });
        const arr = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        setTambahanItems(arr);
      } catch {
        // Do not block monitoring if tambahan fails
        setTambahanItems([]);
      } finally {
        // no-op
      }
    };
    // Load tambahan for any tab to enable summaries where needed
    fetchTambahan();
  }, [activeTab, monthIndex, teamId, year, user?.role]);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        setLoadingDaily(true);
        const mm = String(monthIndex + 1).padStart(2, "0");
        const first = `${year}-${mm}-01`;
        const res = await axios.get("/monitoring/harian/bulan", {
          params: { tanggal: first, teamId: teamId || undefined },
        });
        setDailyData(excludeUsers(res.data));
      } catch (err) {
        handleAxiosError(err, "Gagal mengambil monitoring harian");
      } finally {
        setLoadingDaily(false);
      }
    };
    if (activeTab === "harian") fetchDaily();
  }, [activeTab, monthIndex, teamId, year, excludeUsers]);

  useEffect(() => {
    const fetchWeekly = async () => {
      if (!weekStarts.length || activeTab !== "mingguan") return;
      try {
        setLoadingWeekly(true);
        const start = new Date(weekStarts[weekIndex]);
        const minggu = `${start.getFullYear()}-${String(
          start.getMonth() + 1
        ).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
        const [res, penRes, penAllRes] = await Promise.all([
          axios.get("/monitoring/mingguan/all", {
            params: { minggu, teamId: teamId || undefined },
          }),
          axios.get("/monitoring/penugasan/minggu", {
            params: { minggu, teamId: teamId || undefined },
          }),
          axios.get("/penugasan/minggu/all", {
            params: { minggu },
          }),
        ]);
        const baseRows = excludeUsers(res.data);
        const penRows = excludeUsers(penRes.data);
        const penAll = Array.isArray(penAllRes.data) ? penAllRes.data : [];
        // Jika ada filter tim, jangan gunakan sumber penugasan mingguan global (tanpa filter),
        // agar tidak menambahkan nama dari tim lain.
        const usePenAll = !teamId && Array.isArray(penAll) && penAll.length > 0;
        // Gabungkan dengan Tugas Tambahan untuk minggu yang sama
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const inWeek = (iso) => {
          const dt = new Date(iso);
          return dt >= start && dt <= end;
        };
        const selectedWeekNumber = weekIndex + 1;
        const selectedMonth = monthIndex + 1;
        const selectedYear = year;
        const tambahanThisWeek = (
          Array.isArray(tambahanItems) ? tambahanItems : []
        ).filter((t) => {
          if (t.tanggal) {
            const dt = new Date(t.tanggal);
            const byRange = inWeek(t.tanggal);
            const byComputedWeek =
              dt.getFullYear() === selectedYear &&
              dt.getMonth() + 1 === selectedMonth &&
              getWeekOfMonth(dt) === selectedWeekNumber;
            return byRange || byComputedWeek;
          }
          const hasPeriod =
            t.minggu !== undefined &&
            t.minggu !== null &&
            t.bulan !== undefined &&
            t.bulan !== null &&
            t.tahun !== undefined &&
            t.tahun !== null;
          if (hasPeriod) {
            const tm = parseInt(t.minggu, 10);
            const tb = parseInt(t.bulan, 10);
            const ty = parseInt(t.tahun, 10);
            return (
              tm === selectedWeekNumber &&
              tb === selectedMonth &&
              ty === selectedYear
            );
          }
          return false;
        });

        const keyOf = (u) =>
          String(
            u?.userId ??
              u?.pegawaiId ??
              u?.user?.id ??
              u?.pegawai?.id ??
              u?.id ??
              u?.nama
          );
        const nameOf = (u) =>
          u?.user?.nama ??
          u?.pegawai?.nama ??
          u?.nama ??
          u?.fullName ??
          u?.name ??
          "-";

        const baseMap = new Map();
        const baseByName = new Map();
        const norm = (s) =>
          typeof s === "string"
            ? s.toLowerCase().replace(/\s+/g, " ").trim()
            : "";
        (Array.isArray(baseRows) ? baseRows : []).forEach((r) => {
          const k = keyOf(r);
          const nm = nameOf(r);
          // Baseline user list; do not count from baseRows to avoid double counting
          baseMap.set(k, { nama: nm, total: 0, selesai: 0 });
          if (nm) baseByName.set(norm(nm), k);
        });

        // Tambahkan kontribusi penugasan (tugas mingguan) per user ke baseMap
        if (!usePenAll) {
          (Array.isArray(penRows) ? penRows : []).forEach((p) => {
            const kRaw = keyOf(p);
            const nm = nameOf(p);
            const k = baseMap.has(kRaw)
              ? kRaw
              : nm && baseByName.has(norm(nm))
              ? baseByName.get(norm(nm))
              : kRaw;
            const cur = baseMap.get(k) || { nama: nm, total: 0, selesai: 0 };
            const addTotal = p?.total ?? p?.totalTugas ?? 0;
            const addSelesai = p?.selesai ?? p?.done ?? 0;
            cur.total =
              (cur.total || 0) + (typeof addTotal === "number" ? addTotal : 0);
            cur.selesai =
              (cur.selesai || 0) +
              (typeof addSelesai === "number" ? addSelesai : 0);
            if (!baseMap.has(k) && nm) baseByName.set(norm(nm), k);
            baseMap.set(k, cur);
          });
        }

        // Tambahkan kontribusi per-user dari /penugasan/minggu/all (jika tersedia)
        if (usePenAll) {
          penAll.forEach((u) => {
            const nm = u?.nama || u?.user?.nama || u?.pegawai?.nama;
            if (!nm) return;
            const nameKey = baseByName.get(norm(nm));
            // Hanya merger ke user yang sudah ada pada baseline; jangan buat entri baru dari data tugas
            if (!nameKey) return;
            const cur = baseMap.get(nameKey) || {
              nama: nm,
              total: 0,
              selesai: 0,
            };
            const tugas = Array.isArray(u.tugas) ? u.tugas : [];
            const addTotal = tugas.length;
            const addSelesai = tugas.filter(
              (t) => t.status === STATUS.SELESAI_DIKERJAKAN
            ).length;
            cur.total = (cur.total || 0) + addTotal;
            cur.selesai = (cur.selesai || 0) + addSelesai;
            baseMap.set(nameKey, cur);
          });
        }

        const tambahanMap = new Map();
        tambahanThisWeek.forEach((t) => {
          // Merge hanya jika bisa dipetakan ke user baseline (berdasarkan nama/id)
          const rawKey = keyOf(t);
          const nm = nameOf(t);
          const nameKey = nm ? baseByName.get(norm(nm)) : undefined;
          const existingKey =
            nameKey ?? (baseMap.has(rawKey) ? rawKey : undefined);
          if (!existingKey) return;
          const cur = tambahanMap.get(existingKey) || {
            nama: nm,
            total: 0,
            selesai: 0,
          };
          cur.total += 1;
          if (t.status === STATUS.SELESAI_DIKERJAKAN) cur.selesai += 1;
          tambahanMap.set(existingKey, cur);
        });

        // Union keys
        const keys = new Set([...baseMap.keys(), ...tambahanMap.keys()]);
        const merged = [...keys]
          .map((k) => {
            const b = baseMap.get(k) || {
              nama: tambahanMap.get(k)?.nama || "-",
              total: 0,
              selesai: 0,
            };
            const x = tambahanMap.get(k) || { total: 0, selesai: 0 };
            const total = (b.total || 0) + (x.total || 0);
            const selesai = (b.selesai || 0) + (x.selesai || 0);
            const persen = total ? Math.round((selesai / total) * 100) : 0;
            return { userId: k, nama: b.nama, total, selesai, persen };
          })
          // filter excluded names
          .filter((u) => !EXCLUDED_NAMES.includes(u.nama));

        setWeeklyData(merged);
      } catch (err) {
        handleAxiosError(err, "Gagal mengambil monitoring mingguan");
      } finally {
        setLoadingWeekly(false);
      }
    };
    fetchWeekly();
  }, [
    activeTab,
    weekIndex,
    weekStarts,
    teamId,
    year,
    monthIndex,
    tambahanItems,
    EXCLUDED_NAMES,
    excludeUsers,
  ]);

  // Sinkronkan kolom minggu terpilih di Matrix dengan capaian dari Ringkasan Minggu Ini
  useEffect(() => {
    if (!Array.isArray(weeklyMonthData) || weeklyMonthData.length === 0) {
      setWeeklyMonthView(weeklyMonthData);
      return;
    }
    const mapPersen = new Map();
    (Array.isArray(weeklyData) ? weeklyData : []).forEach((u) => {
      const idKey = u?.userId != null ? String(u.userId) : undefined;
      const nameKey = (u?.nama || "").toLowerCase().replace(/\s+/g, " ").trim();
      if (idKey) mapPersen.set(idKey, u.persen);
      if (nameKey) mapPersen.set(nameKey, u.persen);
    });
    const view = weeklyMonthData.map((row) => {
      const idKey = row?.userId != null ? String(row.userId) : undefined;
      const nameKey = (row?.nama || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
      const persen = (idKey && mapPersen.get(idKey)) ?? mapPersen.get(nameKey);
      if (
        typeof persen === "number" &&
        Array.isArray(row.weeks) &&
        row.weeks[weekIndex]
      ) {
        const weeks = row.weeks.slice();
        weeks[weekIndex] = { ...weeks[weekIndex], persen };
        return { ...row, weeks };
      }
      return row;
    });
    setWeeklyMonthView(view);
  }, [weeklyMonthData, weeklyData, weekIndex]);

  useEffect(() => {
    const fetchWeeklyMonth = async () => {
      if (activeTab !== "mingguan") return;
      try {
        setLoadingWeeklyMonth(true);
        const mm = String(monthIndex + 1).padStart(2, "0");
        const first = `${year}-${mm}-01`;
        const res = await axios.get("/monitoring/mingguan/bulan", {
          params: { tanggal: first, teamId: teamId || undefined },
        });
        setWeeklyMonthData(excludeUsers(res.data));
      } catch (err) {
        handleAxiosError(err, "Gagal mengambil monitoring mingguan per bulan");
      } finally {
        setLoadingWeeklyMonth(false);
      }
    };
    fetchWeeklyMonth();
  }, [activeTab, monthIndex, teamId, year, excludeUsers, EXCLUDED_NAMES]);

  useEffect(() => {
    const fetchMonthly = async () => {
      if (activeTab !== "bulanan") return;
      try {
        setLoadingMonthly(true);
        const [res, teamsRes] = await Promise.all([
          axios.get("/monitoring/bulanan/matrix", {
            params: { year, teamId: teamId || undefined },
          }),
          // Ambil daftar tim (berisi anggota) agar bisa menurunkan daftar pegawai
          axios.get("/teams/all").catch(() => ({ data: [] })),
        ]);

        const matrixRaw = Array.isArray(res.data) ? res.data : [];
        const matrix = matrixRaw.filter(
          (u) => !EXCLUDED_NAMES.includes(u?.nama)
        );
        // gunakan matrix terfilter langsung di bawah

        let teams = Array.isArray(teamsRes.data) ? teamsRes.data : [];
        // Fallback: jika kosong, coba endpoint lain yang umum dipakai
        if (!Array.isArray(teams) || teams.length === 0) {
          try {
            const t1 = await axios.get("/teams");
            teams = Array.isArray(t1.data) ? t1.data : [];
            if (teams.length === 0) {
              const t2 = await axios.get("/teams/member");
              teams = Array.isArray(t2.data) ? t2.data : [];
            }
          } catch {
            teams = [];
          }
        }
        const targetTeams = teamId
          ? teams.filter((t) => String(t?.id) === String(teamId))
          : teams;
        const userMap = new Map();
        targetTeams.forEach((t) => {
          const members = Array.isArray(t?.members) ? t.members : [];
          members.forEach((m) => {
            const uid =
              m?.userId ??
              m?.id ??
              m?.user?.id ??
              m?.pegawaiId ??
              m?.pegawai?.id;
            const nama =
              m?.nama ??
              m?.user?.nama ??
              m?.pegawai?.nama ??
              m?.fullName ??
              m?.name;
            if (!nama) return;
            if (EXCLUDED_NAMES.includes(nama)) return;
            const key = uid ? String(uid) : `nama:${nama}`;
            if (!userMap.has(key)) userMap.set(key, { id: uid ?? null, nama });
          });
        });
        const filteredUsers = Array.from(userMap.values()).map((u) => ({
          id: u.id ?? u.nama,
          nama: u.nama,
        }));

        // Bentuk baseline data 12 bulan = 0% untuk semua user terpilih
        const baseline = filteredUsers.map((u) => ({
          userId: u.id,
          nama: u.nama,
          months: Array.from({ length: 12 }, () => ({ persen: 0 })),
        }));

        // Gunakan data bulanan dari backend matrix (teragregasi per bulan berdasarkan tugas) tanpa merata-ratakan persen mingguan
        const norm = (s) =>
          typeof s === "string"
            ? s.toLowerCase().replace(/\s+/g, " ").trim()
            : "";
        const merged = baseline.map((b) => {
          const kName = norm(b.nama);
          const fromBackend = matrix.find(
            (d) => d.userId === b.userId || norm(d.nama) === kName
          );
          return fromBackend ? { ...b, months: fromBackend.months } : b;
        });

        // Jika tidak ada baseline (mis. gagal ambil users), gunakan matrix backend langsung
        let candidate = merged.length > 0 ? merged : matrix;

        // Sesuaikan rumus bulanan seperti di Dashboard:
        // Override bulan terpilih dengan rata-rata persen mingguan (berdasarkan penugasan mingguan + tugas tambahan)
        try {
          // Hitung awal minggu untuk bulan terpilih
          const first = new Date(year, monthIndex, 1);
          const last = new Date(year, monthIndex + 1, 0);
          const weekStarts = (() => {
            const starts = [];
            const start = new Date(first);
            start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
            for (let d = new Date(start); d <= last; d.setDate(d.getDate() + 7))
              starts.push(new Date(d));
            return starts;
          })();
          const iso = (d) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(d.getDate()).padStart(2, "0")}`;
          const penWeeks = await Promise.all(
            weekStarts.map((d) =>
              axios
                .get("/penugasan/minggu/all", { params: { minggu: iso(d) } })
                .then((r) => (Array.isArray(r.data) ? r.data : []))
                .catch(() => [])
            )
          );
          // Buat override berbasis key user (id jika ada; fallback ke nama dinormalisasi)
          const normName = (s) =>
            typeof s === "string"
              ? s.toLowerCase().replace(/\s+/g, " ").trim()
              : "";
          const keyFrom = (nama, id) =>
            id != null ? String(id) : `nama:${normName(nama)}`;
          const keyFromCandidate = (row) => {
            const nama = row?.nama;
            const id = row?.userId;
            if (id == null) return `nama:${normName(nama)}`;
            const idStr = String(id);
            // If userId equals the display name (baseline fallback), treat as name-key
            if (typeof nama === "string" && idStr === nama)
              return `nama:${normName(nama)}`;
            if (idStr.startsWith("nama:")) return idStr; // already name-key
            return idStr; // real id
          };
          const targetKeys = new Set(
            (Array.isArray(candidate) ? candidate : [])
              .map((row) => keyFromCandidate(row))
              .filter(Boolean)
          );

          // Kumpulkan persen per minggu per user (id/nama), dan hitung rata-rata bulanan dibagi jumlah minggu dalam bulan
          const nameDisplay = new Map(); // key -> display name
          const weeklyPercents = weekStarts.map((start, wi) => {
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            const penAll = Array.isArray(penWeeks[wi]) ? penWeeks[wi] : [];
            const perUser = new Map(); // key -> { total, selesai }
            penAll.forEach((u) => {
              const nm = u?.nama || u?.user?.nama || u?.pegawai?.nama;
              const uid = u?.userId || u?.id || u?.user?.id || u?.pegawai?.id;
              if (!nm || EXCLUDED_NAMES.includes(nm)) return;
              const key = keyFrom(nm, uid);
              nameDisplay.set(key, nm);
              const tugas = Array.isArray(u.tugas) ? u.tugas : [];
              const tot = tugas.length;
              const done = tugas.filter(
                (t) => t.status === STATUS.SELESAI_DIKERJAKAN
              ).length;
              perUser.set(key, { total: tot, selesai: done });
            });
            const tambahanInWeek = (
              Array.isArray(tambahanItems) ? tambahanItems : []
            ).filter((t) => {
              if (t?.tanggal) {
                const dt = new Date(t.tanggal);
                return dt >= start && dt <= end;
              }
              const hasPeriod =
                (t?.minggu ?? null) !== null &&
                (t?.bulan ?? null) !== null &&
                (t?.tahun ?? null) !== null;
              if (hasPeriod) {
                const tm = parseInt(t.minggu, 10);
                const tb = parseInt(t.bulan, 10);
                const ty = parseInt(t.tahun, 10);
                const selWeek = getWeekOfMonth(start);
                return (
                  tm === selWeek &&
                  tb === start.getMonth() + 1 &&
                  ty === start.getFullYear()
                );
              }
              return false;
            });
            const addMap = new Map(); // key -> { total, selesai }
            tambahanInWeek.forEach((t) => {
              const nm = t?.user?.nama || t?.pegawai?.nama || t?.nama;
              const uid =
                t?.userId ?? t?.pegawaiId ?? t?.user?.id ?? t?.pegawai?.id;
              if (!nm || EXCLUDED_NAMES.includes(nm)) return;
              const key = keyFrom(nm, uid);
              nameDisplay.set(key, nm);
              const cur = addMap.get(key) || { total: 0, selesai: 0 };
              cur.total += 1;
              if (t.status === STATUS.SELESAI_DIKERJAKAN) cur.selesai += 1;
              addMap.set(key, cur);
            });
            const perWeekPercent = new Map();
            const keys = new Set([
              ...targetKeys,
              ...perUser.keys(),
              ...addMap.keys(),
            ]);
            keys.forEach((k) => {
              if (!k) return;
              const b = perUser.get(k) || { total: 0, selesai: 0 };
              const x = addMap.get(k) || { total: 0, selesai: 0 };
              const total = (b.total || 0) + (x.total || 0);
              const selesai = (b.selesai || 0) + (x.selesai || 0);
              const persen = total ? Math.round((selesai / total) * 100) : 0;
              perWeekPercent.set(k, persen);
            });
            return perWeekPercent;
          });

          const weekCount = weekStarts.length || 1;
          const overrideAvg = new Map(); // key -> avg
          const weeklyNameKeys = new Set();
          weeklyPercents.forEach((m) =>
            m.forEach((_, key) => weeklyNameKeys.add(key))
          );
          const allKeys = new Set([
            ...Array.from(targetKeys.values()),
            ...Array.from(weeklyNameKeys.values()),
          ]);
          allKeys.forEach((nameKey) => {
            let sum = 0;
            for (let wi = 0; wi < weeklyPercents.length; wi++) {
              const map = weeklyPercents[wi];
              sum += map.get(nameKey) || 0;
            }
            overrideAvg.set(nameKey, Math.round(sum / weekCount));
          });

          if (overrideAvg.size > 0 && Array.isArray(candidate)) {
            const byKey = new Map(
              candidate.map((row) => [keyFromCandidate(row), row])
            );
            // Tambahkan row baru jika belum ada di candidate tetapi ada di weekly
            const extras = [];
            allKeys.forEach((nameKey) => {
              if (!byKey.has(nameKey)) {
                const display =
                  nameDisplay.get(nameKey) ||
                  (String(nameKey).startsWith("nama:")
                    ? String(nameKey).slice(5)
                    : String(nameKey));
                const months = Array.from({ length: 12 }, () => ({
                  persen: 0,
                }));
                months[monthIndex] = { persen: overrideAvg.get(nameKey) || 0 };
                const uid =
                  typeof nameKey === "string" && nameKey.startsWith("nama:")
                    ? null
                    : String(nameKey);
                extras.push({ userId: uid, nama: display, months });
              }
            });
            // Siapkan fallback pencocokan berdasarkan nama tampilan (case-insensitive)
            const avgByName = new Map(); // normName -> avg
            overrideAvg.forEach((val, k) => {
              const disp = nameDisplay.get(k);
              const nm =
                typeof disp === "string"
                  ? disp
                  : String(k).startsWith("nama:")
                  ? String(k).slice(5)
                  : undefined;
              if (nm)
                avgByName.set(
                  nm.toLowerCase().replace(/\s+/g, " ").trim(),
                  val
                );
            });

            candidate = candidate.map((row) => {
              const rKey = keyFromCandidate(row);
              let avg = overrideAvg.get(rKey);
              if (typeof avg !== "number") {
                const nm = (row?.nama || "")
                  .toLowerCase()
                  .replace(/\s+/g, " ")
                  .trim();
                avg = avgByName.get(nm);
              }
              if (typeof avg === "number" && Array.isArray(row.months)) {
                const months = row.months.slice();
                months[monthIndex] = { persen: avg };
                return { ...row, months };
              }
              return row;
            });
            if (!teamId && extras.length) candidate = [...candidate, ...extras];
          }

          // Fallback 1: jika override dari penugasan mingguan tidak menghasilkan nilai (semua 0 atau map kosong),
          // gunakan ringkasan mingguan berbasis laporan harian (endpoint yang sama dipakai di tab Mingguan Summary)
          let needFallback =
            overrideAvg.size === 0 ||
            Array.from(overrideAvg.values()).every((v) => !v || v === 0);
          if (needFallback && Array.isArray(candidate)) {
            try {
              const weeklyAll = await Promise.all(
                weekStarts.map((d) =>
                  axios
                    .get("/monitoring/mingguan/all", {
                      params: { minggu: iso(d), teamId: teamId || undefined },
                    })
                    .then((r) => (Array.isArray(r.data) ? r.data : []))
                    .catch(() => [])
                )
              );
              const altAvg = new Map(); // key -> avg
              const count = weekStarts.length || 1;
              // Build mapping per userId/name
              const normNm = (s) =>
                typeof s === "string"
                  ? s.toLowerCase().replace(/\s+/g, " ").trim()
                  : "";
              for (let wi = 0; wi < weeklyAll.length; wi++) {
                const arr = weeklyAll[wi];
                arr.forEach((u) => {
                  const key = keyFrom(u?.nama, u?.userId ?? u?.id);
                  const p = Number(u?.persen) || 0;
                  const cur = altAvg.get(key) || 0;
                  altAvg.set(key, cur + p);
                });
              }
              // Apply averages
              if (altAvg.size > 0) {
                candidate = candidate.map((row) => {
                  const rKey = keyFromCandidate(row);
                  let avg = altAvg.get(rKey);
                  if (typeof avg !== "number") {
                    // try by name fallback
                    const nm = normNm(row?.nama);
                    // find any alt key with same display name
                    const match = Array.from(altAvg.entries()).find(
                      ([k]) =>
                        (
                          nameDisplay.get(k) ||
                          (String(k).startsWith("nama:")
                            ? String(k).slice(5)
                            : "")
                        )
                          ?.toLowerCase()
                          .replace(/\s+/g, " ")
                          .trim() === nm
                    );
                    if (match) avg = match[1];
                  }
                  if (typeof avg === "number" && Array.isArray(row.months)) {
                    const months = row.months.slice();
                    months[monthIndex] = { persen: Math.round(avg / count) };
                    return { ...row, months };
                  }
                  return row;
                });
                // Not a failure anymore
                needFallback = false;
              }
            } catch {
              // ignore alt fallback errors
            }
          }

          // Fallback 2: gunakan data matrix mingguan bulan ini (weeklyMonthView bila ada override kolom terpilih, jika tidak weeklyMonthData)
          if (needFallback && Array.isArray(candidate)) {
            const weeklySource =
              Array.isArray(weeklyMonthView) && weeklyMonthView.length
                ? weeklyMonthView
                : Array.isArray(weeklyMonthData) && weeklyMonthData.length
                ? weeklyMonthData
                : [];
            if (weeklySource.length) {
              const byNameWeek = new Map(); // normName -> avg persen
              // weekCount untuk bulan ini (ikuti panjang weeks pada baris pertama, atau 5 sebagai default)
              const wCount = Array.isArray(weeklySource[0]?.weeks)
                ? weeklySource[0].weeks.length || 5
                : 5;
              weeklySource.forEach((row) => {
                const nm = (row?.nama || "")
                  .toLowerCase()
                  .replace(/\s+/g, " ")
                  .trim();
                const weeks = Array.isArray(row?.weeks) ? row.weeks : [];
                const sum = weeks.reduce(
                  (s, w) => s + (Number(w?.persen) || 0),
                  0
                );
                const avg = Math.round(sum / Math.max(wCount, 1));
                byNameWeek.set(nm, avg);
              });
              candidate = candidate.map((row) => {
                const nm = (row?.nama || "")
                  .toLowerCase()
                  .replace(/\s+/g, " ")
                  .trim();
                const avg = byNameWeek.get(nm);
                if (typeof avg === "number" && Array.isArray(row.months)) {
                  const months = row.months.slice();
                  months[monthIndex] = { persen: avg };
                  return { ...row, months };
                }
                return row;
              });
            }
          }
        } catch {
          // abaikan jika override gagal; gunakan matrix backend apa adanya
        }

        // Urutkan berdasarkan abjad nama
        const sorted = [...candidate].sort((a, b) =>
          (a?.nama || "").localeCompare(b?.nama || "", "id", {
            sensitivity: "base",
          })
        );
        setMonthlyViewData(sorted);
      } catch (err) {
        handleAxiosError(err, "Gagal mengambil monitoring bulanan");
      } finally {
        setLoadingMonthly(false);
      }
    };
    fetchMonthly();
  }, [
    activeTab,
    year,
    teamId,
    monthIndex,
    weekIndex,
    weeklyData,
    tambahanItems,
    EXCLUDED_NAMES,
    weeklyMonthData,
    weeklyMonthView,
  ]);

  // Fetch Capaian Bulan Ini (per-user aggregate for selected month)
  useEffect(() => {
    const fetchMonthlyCurrent = async () => {
      if (activeTab !== "bulanan") return;
      const bulanNum = Number(monthIndex + 1);
      if (!bulanNum || bulanNum < 1 || bulanNum > 12) return;
      try {
        setLoadingMonthlyCurrent(true);
        const bulan = String(bulanNum);
        const [res, teamsRes] = await Promise.all([
          axios.get("/monitoring/bulanan/all", {
            params: { year, bulan, teamId: teamId || undefined },
          }),
          axios.get("/teams/all").catch(() => ({ data: [] })),
        ]);

        const taskArr = Array.isArray(res.data) ? res.data : [];
        const teams = Array.isArray(teamsRes.data) ? teamsRes.data : [];

        // Build baseline user list from teams (respect teamId if provided)
        const memberUsers = [];
        teams.forEach((t) => {
          if (teamId && t.id !== teamId) return;
          const members = Array.isArray(t.members) ? t.members : [];
          members.forEach((m) => {
            if (m?.user) memberUsers.push(m.user);
          });
        });
        // Unique by id
        const seen = new Set();
        const baseline = memberUsers
          .filter((u) => {
            if (!u || !u.id || seen.has(u.id)) return false;
            seen.add(u.id);
            if ([ROLES.ADMIN, ROLES.PIMPINAN].includes(u.role)) return false;
            if (EXCLUDED_NAMES.includes(u.nama)) return false;
            return true;
          })
          .map((u) => ({ userId: String(u.id), nama: u.nama }));

        // Index task results by id and by normalized name
        const norm = (s) =>
          typeof s === "string"
            ? s.toLowerCase().replace(/\s+/g, " ").trim()
            : "";
        const byId = new Map(taskArr.map((x) => [String(x.userId), x]));
        const byName = new Map(taskArr.map((x) => [norm(x.nama), x]));

        const merged = baseline.map((u) => {
          const t = byId.get(String(u.userId)) || byName.get(norm(u.nama));
          const selesai = Number(t?.selesai) || 0;
          const total = Number(t?.total) || 0;
          const persen = total ? Math.round((selesai / total) * 100) : 0;
          return { userId: u.userId, nama: u.nama, selesai, total, persen };
        });

        // If no team filter and there are users in tasks not part of any team list above, append them (defensive)
        if (!teamId && taskArr.length) {
          const known = new Set(merged.map((m) => String(m.userId)));
          taskArr.forEach((x) => {
            const id = String(x.userId);
            if (!known.has(id) && !EXCLUDED_NAMES.includes(x.nama)) {
              known.add(id);
              merged.push({
                userId: id,
                nama: x.nama,
                selesai: Number(x.selesai) || 0,
                total: Number(x.total) || 0,
                persen: Number.isFinite(x.persen)
                  ? x.persen
                  : Number(x.total)
                  ? Math.round(
                      ((Number(x.selesai) || 0) / Number(x.total)) * 100
                    )
                  : 0,
              });
            }
          });
        }

        // Sort by name
        merged.sort((a, b) =>
          (a?.nama || "").localeCompare(b?.nama || "", "id", {
            sensitivity: "base",
          })
        );
        setMonthlyCurrentData(merged);
      } catch (err) {
        handleAxiosError(err, "Gagal mengambil capaian bulan ini");
        setMonthlyCurrentData([]);
      } finally {
        setLoadingMonthlyCurrent(false);
      }
    };
    fetchMonthlyCurrent();
  }, [activeTab, year, monthIndex, teamId, EXCLUDED_NAMES]);

  // No separate tambahan UI; combination handled where possible by backend data

  // Derived sorted views (must be before any early returns)
  // Weekly matrix sorting handled inside WeeklyMatrix header

  // Sorting untuk tabel list dipindahkan ke header tabel (WeeklyProgressTable)

  // Monthly year sorting handled inside MonthlyMatrix header

  // Tab-specific loading skeletons for smooth UX
  if (activeTab === "harian" && loadingDaily) {
    const dayCount = new Date(year, monthIndex + 1, 0).getDate();
    return <DailyMatrixSkeleton dayCount={dayCount} rows={8} />;
  }
  if (activeTab === "mingguan" && (loadingWeekly || loadingWeeklyMonth)) {
    // Show matrix-sized skeleton when on matrix mode; otherwise summary columns
    const cols =
      weeklyMode === "matrix"
        ? Array.isArray(weekStarts)
          ? weekStarts.length + 1
          : 5
        : 4;
    return <TableSkeleton cols={cols} />;
  }
  // Note: for Bulanan, skeleton handled per sub-tab below

  return (
    <div ref={contentRef}>
      {/* HARIAN */}
      {activeTab === "harian" && (
        <>
          <DailyMatrix data={dailyData} monthIndex={monthIndex} year={year} />
        </>
      )}

      {/* MINGGUAN */}
      {activeTab === "mingguan" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex flex-wrap gap-2" role="tablist">
              {["summary", "matrix"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWeeklyMode(mode)}
                  role="tab"
                  aria-selected={weeklyMode === mode}
                  className={`px-4 py-1.5 rounded-lg font-semibold text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150 ease-in-out ${
                    weeklyMode === mode
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {mode === "summary" ? "Ringkasan Minggu" : "Ringkasan Bulan"}
                </button>
              ))}
            </div>
            {(lastUpdateIso || lastUpdateText) && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lastUpdateIso ? (
                  <>
                    Data diambil pada <strong>{formatWita(lastUpdateIso)}</strong>
                  </>
                ) : (
                  lastUpdateText
                )}
              </p>
            )}
          </div>

          {weeklyMode === "matrix" ? (
            <WeeklyMatrix
              data={weeklyMonthView.length ? weeklyMonthView : weeklyMonthData}
              weeks={weekStarts}
              selectedWeek={weekIndex}
              onSelectWeek={() => {}}
            />
          ) : (
            <div>
              <WeeklyProgressTable data={weeklyData} />
            </div>
          )}
        </>
      )}

      {/* BULANAN */}
      {activeTab === "bulanan" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex flex-wrap gap-2" role="tablist">
              {[
                { key: "current", label: "Ringkasan Bulan" },
                { key: "year", label: "Ringkasan Tahun" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setMonthlyMode(t.key)}
                  role="tab"
                  aria-selected={monthlyMode === t.key}
                  className={`px-4 py-1.5 rounded-lg font-semibold text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150 ease-in-out ${
                    monthlyMode === t.key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {(lastUpdateIso || lastUpdateText) && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lastUpdateIso ? (
                  <>
                    Data diambil pada <strong>{formatWita(lastUpdateIso)}</strong>
                  </>
                ) : (
                  lastUpdateText
                )}
              </p>
            )}
          </div>

          {monthlyMode === "current" ? (
            loadingMonthlyCurrent ? (
              <TableSkeleton cols={4} />
            ) : (
              <WeeklyProgressTable data={monthlyCurrentData} />
            )
          ) : loadingMonthly ? (
            <TableSkeleton cols={12 + 1} />
          ) : monthlyViewData.length > 0 ? (
            <MonthlyMatrix data={monthlyViewData} />
          ) : (
            <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
              Tidak ada data untuk tahun ini.
            </div>
          )}
        </>
      )}
    </div>
  );
}
