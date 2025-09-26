import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import clsx from "clsx";
import {
  Activity,
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  ClipboardList,
  Target,
  TrendingUp,
  Users as UsersIcon,
} from "lucide-react";
import Loading from "../../components/Loading";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import { useAuth } from "../auth/useAuth";
import { handleAxiosError } from "../../utils/alerts";
import { STATUS, STATUS_LABELS } from "../../utils/status";
import months from "../../utils/months";
import formatDate from "../../utils/formatDate";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const FALLBACK_TEAM_KEY = "__others__";

const numberFormatter = new Intl.NumberFormat("id-ID");

const formatISO = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getWeekBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const diff = (day + 6) % 7;
  start.setDate(start.getDate() - diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

const collectTeamMappings = (teams = []) => {
  const teamMap = new Map();

  teams.forEach((team) => {
    const idRaw = team?.id ?? team?.teamId ?? team?.value ?? team?.kode;
    const name =
      team?.namaTim ?? team?.nama ?? team?.name ?? `Tim ${idRaw ?? ""}`;
    const teamId = idRaw != null ? String(idRaw) : FALLBACK_TEAM_KEY;

    const members = Array.isArray(team?.members) ? team.members : [];
    members.forEach((member) => {
      const user = member?.user ?? member?.pegawai ?? member;
      const userId =
        user?.id ??
        member?.userId ??
        member?.pegawaiId ??
        member?.pegawai?.id ??
        member?.user?.id;
      if (userId == null) return;
      const key = String(userId);
      teamMap.set(key, { id: teamId, name: name || "Tanpa Tim" });
    });
  });

  return { teamMap };
};

const getUserIdFromRow = (row) => {
  if (!row || typeof row !== "object") return null;
  return (
    row.userId ??
    row.pegawaiId ??
    row.user?.id ??
    row.pegawai?.id ??
    (Array.isArray(row.users) ? row.users[0]?.id : null) ??
    null
  );
};

const getTotalFromRow = (row) => {
  if (!row || typeof row !== "object") return 0;
  if (typeof row.total === "number") return row.total;
  if (typeof row.totalTugas === "number") return row.totalTugas;
  if (typeof row.jumlah === "number") return row.jumlah;
  if (Array.isArray(row.tugas)) return row.tugas.length;
  if (Array.isArray(row.detail)) {
    return row.detail.reduce((sum, item) => sum + Number(item?.total || 0), 0);
  }
  return 0;
};

const getDoneFromRow = (row) => {
  if (!row || typeof row !== "object") return 0;
  if (typeof row.selesai === "number") return row.selesai;
  if (typeof row.done === "number") return row.done;
  if (typeof row.selesaiTugas === "number") return row.selesaiTugas;
  if (Array.isArray(row.tugas)) {
    return row.tugas.filter((t) => t?.status === STATUS.SELESAI_DIKERJAKAN)
      .length;
  }
  if (Array.isArray(row.detail)) {
    return row.detail.reduce(
      (sum, item) => sum + Number(item?.selesai || 0),
      0
    );
  }
  return 0;
};

const classifyProgress = (progress) => {
  if (!Number.isFinite(progress))
    return { label: "Belum Ada Data", tone: "text-gray-500" };
  if (progress >= 85)
    return { label: "Sangat Baik", tone: "text-green-600 dark:text-green-400" };
  if (progress >= 70)
    return { label: "Baik", tone: "text-blue-600 dark:text-blue-300" };
  if (progress >= 50)
    return {
      label: "Perlu Perhatian",
      tone: "text-amber-600 dark:text-amber-400",
    };
  return { label: "Kritis", tone: "text-red-600 dark:text-red-400" };
};

const aggregateTeamPerformance = (rows, teamMap) => {
  const dataMap = new Map();
  const source = Array.isArray(rows) ? rows : [];

  source.forEach((row) => {
    const userId = getUserIdFromRow(row);
    const team = userId != null ? teamMap.get(String(userId)) : null;
    const teamKey = team?.id ?? FALLBACK_TEAM_KEY;
    const name = team?.name ?? "Tanpa Tim";

    if (!dataMap.has(teamKey)) {
      dataMap.set(teamKey, {
        teamId: teamKey,
        name,
        total: 0,
        selesai: 0,
        members: new Set(),
      });
    }

    const entry = dataMap.get(teamKey);
    entry.total += Number(getTotalFromRow(row)) || 0;
    entry.selesai += Number(getDoneFromRow(row)) || 0;
    if (userId != null) entry.members.add(String(userId));
  });

  return Array.from(dataMap.values())
    .map((entry) => {
      const backlog = Math.max(entry.total - entry.selesai, 0);
      const progress = entry.total
        ? Math.round((entry.selesai / Math.max(entry.total, 1)) * 100)
        : 0;
      const status = classifyProgress(progress);
      return {
        teamId: entry.teamId,
        name: entry.name,
        total: entry.total,
        selesai: entry.selesai,
        backlog,
        progress,
        status,
        memberCount: entry.members.size,
      };
    })
    .filter((entry) => entry.total > 0 || entry.selesai > 0)
    .sort((a, b) => b.total - a.total || b.progress - a.progress);
};

const aggregateYearlyPerformance = (matrixRows, teamMap) => {
  const source = Array.isArray(matrixRows) ? matrixRows : [];
  const dataMap = new Map();

  source.forEach((row) => {
    const userId = row?.userId ?? row?.id ?? null;
    const monthsData = Array.isArray(row?.months) ? row.months : [];
    const team = userId != null ? teamMap.get(String(userId)) : null;
    const teamKey = team?.id ?? FALLBACK_TEAM_KEY;
    const name = team?.name ?? "Tanpa Tim";

    if (!dataMap.has(teamKey)) {
      dataMap.set(teamKey, {
        teamId: teamKey,
        name,
        sum: 0,
        count: 0,
        members: new Set(),
      });
    }

    const entry = dataMap.get(teamKey);
    monthsData.forEach((m) => {
      const persen = Number(m?.persen);
      if (Number.isFinite(persen) && persen >= 0) {
        entry.sum += persen;
        entry.count += 1;
      }
    });
    if (userId != null) entry.members.add(String(userId));
  });

  return Array.from(dataMap.values())
    .map((entry) => {
      const progress = entry.count ? Math.round(entry.sum / entry.count) : 0;
      return {
        teamId: entry.teamId,
        name: entry.name,
        progress,
        status: classifyProgress(progress),
        memberCount: entry.members.size,
      };
    })
    .filter((entry) => entry.progress > 0)
    .sort((a, b) => b.progress - a.progress);
};

const computeTrends = (matrixRows) => {
  const source = Array.isArray(matrixRows) ? matrixRows : [];
  const labels = months;
  return labels.map((label, idx) => {
    let sum = 0;
    let count = 0;
    source.forEach((row) => {
      const val = Number(row?.months?.[idx]?.persen);
      if (Number.isFinite(val)) {
        sum += val;
        count += 1;
      }
    });
    const value = count ? Math.round(sum / count) : 0;
    return { label, value };
  });
};

const computeTopActivities = (assignments = [], limit) => {
  const map = new Map();
  assignments.forEach((item) => {
    const name =
      item?.kegiatan?.namaKegiatan ??
      item?.namaKegiatan ??
      item?.kegiatan?.nama ??
      "Kegiatan Tanpa Nama";
    const status = item?.status;
    if (!map.has(name)) {
      map.set(name, {
        name,
        total: 0,
        selesai: 0,
        berjalan: 0,
        belum: 0,
      });
    }
    const entry = map.get(name);
    entry.total += 1;
    if (status === STATUS.SELESAI_DIKERJAKAN) entry.selesai += 1;
    else if (status === STATUS.SEDANG_DIKERJAKAN) entry.berjalan += 1;
    else entry.belum += 1;
  });

  const result = Array.from(map.values())
    .map((entry) => ({
      ...entry,
      progress: entry.total
        ? Math.round((entry.selesai / Math.max(entry.total, 1)) * 100)
        : 0,
    }))
    .sort((a, b) => b.total - a.total || b.progress - a.progress);

  if (Number.isFinite(limit) && limit > 0) {
    return result.slice(0, limit);
  }

  return result;
};

const summarizeTeamList = (list = []) => {
  const total = list.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const selesai = list.reduce(
    (sum, item) => sum + (Number(item.selesai) || 0),
    0
  );
  const backlog = list.reduce(
    (sum, item) => sum + (Number(item.backlog) || 0),
    0
  );
  const progress = total ? Math.round((selesai / Math.max(total, 1)) * 100) : 0;
  return { total, selesai, backlog, progress };
};

const buildInsights = ({
  topActivities,
  collectiveWeekly,
  collectiveMonthly,
  yearlyTeams,
}) => {
  const insights = [];
  if (topActivities?.length) {
    const top = topActivities[0];
    insights.push(
      `Kegiatan ${top.name} memiliki ${numberFormatter.format(
        top.total
      )} penugasan dengan capaian ${top.progress}%`
    );
  }
  if (collectiveWeekly.backlog > 0) {
    insights.push(
      `${numberFormatter.format(
        collectiveWeekly.backlog
      )} penugasan mingguan masih menunggu penyelesaian`
    );
  } else if (collectiveWeekly.total > 0) {
    insights.push("Seluruh penugasan mingguan telah terselesaikan");
  }
  if (collectiveMonthly.progress >= 85) {
    insights.push(
      `Capaian bulanan stabil di ${collectiveMonthly.progress}% dan berada di atas target`
    );
  } else if (collectiveMonthly.total > 0) {
    insights.push(
      `Capaian bulanan ${collectiveMonthly.progress}% perlu percepatan tindak lanjut`
    );
  }
  if (yearlyTeams?.length) {
    const best = yearlyTeams[0];
    const worst = yearlyTeams[yearlyTeams.length - 1];
    if (best) {
      insights.push(
        `Tim ${best.name} memimpin capaian tahunan dengan ${best.progress}%`
      );
    }
    if (worst && worst.teamId !== best?.teamId) {
      insights.push(
        `Tim ${worst.name} membutuhkan dukungan karena capaian tahunan ${worst.progress}%`
      );
    }
  }
  return Array.from(new Set(insights)).slice(0, 4);
};

const HighlightCard = ({
  icon: Icon,
  title,
  value,
  description,
  accent = "bg-blue-100 text-blue-600",
}) => (
  <div className="flex items-start gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
    <div
      className={clsx(
        "w-12 h-12 rounded-xl flex items-center justify-center text-xl",
        accent
      )}
    >
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
        {value}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {description}
      </p>
    </div>
  </div>
);

const DEFAULT_ACTIVITY_LIMIT = 5;

const ActivitiesCard = ({ activities }) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibleLimit, setVisibleLimit] = useState(DEFAULT_ACTIVITY_LIMIT);

  const filters = useMemo(
    () => [
      {
        id: "all",
        label: "Semua",
        predicate: () => true,
        emptyMessage: "Belum ada data kegiatan untuk ditampilkan.",
        getMetrics: (activity) => {
          const progress = activity.progress;
          const chipTone =
            progress >= 85
              ? "bg-green-100 text-green-700"
              : progress >= 60
              ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700";
          const chipLabel =
            progress >= 85
              ? "Stabil"
              : progress >= 60
              ? "Perlu Monitoring"
              : "Butuh Percepatan";

          return {
            barColor: "bg-blue-500",
            barValue: progress,
            chipLabel,
            chipTone,
            description: `${numberFormatter.format(activity.total)} penugasan • ${progress}% selesai`,
            details: [
              `Selesai: ${numberFormatter.format(activity.selesai)}`,
              `Sedang: ${numberFormatter.format(activity.berjalan)}`,
              `Belum: ${numberFormatter.format(activity.belum)}`,
            ],
          };
        },
      },
      {
        id: "pending",
        label: "Belum/Sedang",
        predicate: (activity) => activity.belum > 0 || activity.berjalan > 0,
        emptyMessage: "Tidak ada kegiatan yang belum atau sedang berjalan.",
        getMetrics: (activity) => {
          const pendingCount = Number(activity.belum || 0) + Number(activity.berjalan || 0);
          const portion = activity.total
            ? Math.round((pendingCount / Math.max(activity.total, 1)) * 100)
            : 0;
          return {
            barColor: "bg-amber-500",
            barValue: portion,
            chipLabel: `${numberFormatter.format(pendingCount)} belum/sedang`,
            chipTone: "bg-amber-100 text-amber-700",
            description: `${numberFormatter.format(activity.total)} penugasan • ${portion}% belum atau sedang berlangsung`,
            details: [
              `Belum: ${numberFormatter.format(activity.belum)}`,
              `Sedang: ${numberFormatter.format(activity.berjalan)}`,
              `Selesai: ${numberFormatter.format(activity.selesai)}`,
            ],
          };
        },
      },
      {
        id: STATUS.SELESAI_DIKERJAKAN,
        label: STATUS_LABELS[STATUS.SELESAI_DIKERJAKAN] ?? "Selesai",
        predicate: (activity) => activity.selesai > 0,
        emptyMessage: "Tidak ada kegiatan yang telah selesai.",
        getMetrics: (activity) => {
          const portion = activity.total
            ? Math.round((activity.selesai / Math.max(activity.total, 1)) * 100)
            : 0;
          return {
            barColor: "bg-green-500",
            barValue: portion,
            chipLabel: `${numberFormatter.format(activity.selesai)} selesai`,
            chipTone: "bg-green-100 text-green-700",
            description: `${numberFormatter.format(activity.total)} penugasan • ${portion}% telah selesai`,
            details: [
              `Sedang: ${numberFormatter.format(activity.berjalan)}`,
              `Belum: ${numberFormatter.format(activity.belum)}`,
            ],
          };
        },
      },
    ],
    []
  );

  const activeFilter = useMemo(
    () => filters.find((item) => item.id === statusFilter) ?? filters[0],
    [filters, statusFilter]
  );

  const filteredActivities = useMemo(() => {
    const predicate = activeFilter?.predicate ?? (() => true);
    const source = Array.isArray(activities) ? activities : [];
    return source.filter(predicate);
  }, [activities, activeFilter]);

  const visibleActivities = useMemo(() => {
    if (!Number.isFinite(visibleLimit)) return filteredActivities;
    return filteredActivities.slice(0, Math.max(visibleLimit, 0));
  }, [filteredActivities, visibleLimit]);

  const canToggleLimit = filteredActivities.length > DEFAULT_ACTIVITY_LIMIT;
  const isExpanded = !Number.isFinite(visibleLimit);
  const emptyMessage = activeFilter?.emptyMessage;

  const handleFilterChange = (id) => {
    setStatusFilter(id);
    setVisibleLimit(DEFAULT_ACTIVITY_LIMIT);
  };

  const toggleLimit = () => {
    setVisibleLimit((prev) =>
      Number.isFinite(prev) ? Number.POSITIVE_INFINITY : DEFAULT_ACTIVITY_LIMIT
    );
  };

  return (
    <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Ringkasan Kegiatan Berjalan
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aktivitas dengan penugasan terbanyak sebagai indikator prioritas
          </p>
        </div>
        <Activity className="w-8 h-8 text-blue-500" />
      </header>
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={statusFilter === filter.id ? "primary" : "secondary"}
            className={clsx(
              "text-sm px-3 py-1.5",
              statusFilter === filter.id
                ? "shadow"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            )}
            onClick={() => handleFilterChange(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
      <div className="space-y-4">
        {filteredActivities.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        )}
        {visibleActivities.map((activity) => {
          const metrics = activeFilter?.getMetrics(activity);
          const barWidth = Math.max(
            0,
            Math.min(metrics?.barValue ?? 0, 100)
          );

          return (
            <div
              key={activity.name}
              className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/60"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {activity.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {metrics?.description}
                  </p>
                </div>
                {metrics?.chipLabel && (
                  <span
                    className={clsx(
                      "text-xs font-semibold px-2.5 py-1 rounded-full",
                      metrics?.chipTone
                    )}
                  >
                    {metrics.chipLabel}
                  </span>
                )}
              </div>
              <div className="w-full h-3 bg-white dark:bg-gray-900 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all",
                    metrics?.barColor ?? "bg-blue-500"
                  )}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              {!!metrics?.details?.length && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-4">
                  {metrics.details.map((detail) => (
                    <span key={detail}>{detail}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {canToggleLimit && (
        <div className="flex justify-end">
          <Button variant="icon" onClick={toggleLimit}>
            {isExpanded ? "Lihat lebih sedikit" : "Lihat semua"}
          </Button>
        </div>
      )}
    </section>
  );
};

const TeamPerformanceCard = ({ data, period }) => {
  const [tab, setTab] = useState("weekly");
  const tabs = [
    { id: "weekly", label: "Mingguan" },
    { id: "monthly", label: "Bulanan" },
    { id: "yearly", label: "Tahunan" },
  ];

  const activeData = data[tab] ?? [];

  return (
    <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 space-y-4">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <UsersIcon className="w-7 h-7 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Ringkasan Kinerja Tim
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Perbandingan penugasan dan capaian per periode
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={clsx(
                "px-4 py-1.5 rounded-full text-sm font-semibold transition",
                tab === t.id
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {tab === "weekly"
            ? `Periode ${period.weekLabel}`
            : tab === "monthly"
            ? `Periode ${period.monthLabel}`
            : `Tahun ${period.year}`}
        </p>
      </header>
      <div className="space-y-3">
        {activeData.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Belum ada data kinerja untuk periode ini.
          </p>
        )}
        {activeData.map((team) => (
          <div
            key={`${tab}-${team.teamId}`}
            className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/60 space-y-2"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {team.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {team.memberCount || 0} anggota • {team.status.label}
                </p>
              </div>
              <div className={clsx("text-sm font-semibold", team.status.tone)}>
                {team.progress}%
              </div>
            </div>
            {tab === "yearly" ? (
              <div className="h-3 bg-white dark:bg-gray-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${team.progress}%` }}
                />
              </div>
            ) : (
              <>
                <div className="h-3 bg-white dark:bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${team.progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                  <span>
                    Selesai: {numberFormatter.format(team.selesai || 0)}
                  </span>
                  <span>Total: {numberFormatter.format(team.total || 0)}</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const CollectivePerformanceCard = ({ collective, period }) => (
  <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 space-y-4">
    <header className="flex items-center gap-3">
      <Target className="w-7 h-7 text-blue-500" />
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Capaian Kinerja Kolektif
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gambaran agregat capaian organisasi lintas periode
        </p>
      </div>
    </header>
    <div className="grid gap-4 md:grid-cols-3">
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 space-y-2">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
          Mingguan ({period.weekLabel})
        </h3>
        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
          {collective.weekly.progress}%
        </p>
        <p className="text-xs text-blue-700/80 dark:text-blue-300">
          {numberFormatter.format(collective.weekly.selesai)} selesai dari{" "}
          {numberFormatter.format(collective.weekly.total)} penugasan
        </p>
      </div>
      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 space-y-2">
        <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
          Bulanan ({period.monthLabel})
        </h3>
        <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
          {collective.monthly.progress}%
        </p>
        <p className="text-xs text-emerald-700/80 dark:text-emerald-300">
          {numberFormatter.format(collective.monthly.selesai)} selesai dari{" "}
          {numberFormatter.format(collective.monthly.total)} penugasan
        </p>
      </div>
      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 space-y-2">
        <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-200">
          Tahunan ({period.year})
        </h3>
        <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
          {collective.yearly.progress}%
        </p>
        <p className="text-xs text-purple-700/80 dark:text-purple-300">
          {collective.yearly.bestTeam
            ? `Terbaik: ${collective.yearly.bestTeam.name}`
            : "Belum ada data tim"}
        </p>
      </div>
    </div>
    <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Insight Prioritas
      </h3>
      <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
        {collective.insights.length
          ? collective.insights.map((item) => <li key={item}>{item}</li>)
          : [<li key="empty">Belum ada insight yang dapat diturunkan.</li>]}
      </ul>
    </div>
  </section>
);

const TrendsCard = ({ trends }) => {
  const lastSix = trends.slice(-6);
  const chartData = lastSix.map((item) => ({
    label: item.label,
    shortLabel: item.label.slice(0, 3),
    value: item.value,
  }));
  const last = lastSix[lastSix.length - 1];
  const prev = lastSix[lastSix.length - 2];
  const delta = last && prev ? last.value - prev.value : null;
  const recentAvg = lastSix.length
    ? Math.round(
        lastSix.reduce((sum, item) => sum + item.value, 0) / lastSix.length
      )
    : 0;

  return (
    <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 space-y-4">
      <header className="flex items-center gap-3">
        <BarChart2 className="w-7 h-7 text-blue-500" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Visualisasi & Tren
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rata-rata capaian kolektif enam bulan terakhir
          </p>
        </div>
      </header>
      <div className="h-64 w-full">
        {chartData.length > 0 ? (
          <div className="h-full" data-testid="trends-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 12, right: 16, bottom: 8, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                  allowDecimals={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                <Tooltip
                  labelFormatter={(value) =>
                    chartData.find((item) => item.shortLabel === value)?.label ??
                    value
                  }
                  formatter={(value) => [`${value}%`, "Progress"]}
                  contentStyle={{
                    borderRadius: "0.75rem",
                    borderColor: "#e5e7eb",
                    boxShadow:
                      "0 10px 30px rgba(15, 23, 42, 0.08), 0 4px 6px rgba(15, 23, 42, 0.06)",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Progress"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ strokeWidth: 2, r: 5, fill: "#2563eb" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            className="flex h-full flex-col items-center justify-center gap-3"
            data-testid="trends-skeleton"
          >
            <Skeleton className="h-12 w-3/4 max-w-xs" />
            <Skeleton className="h-40 w-full" />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Belum ada data tren yang dapat ditampilkan.
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
        <span>
          Rata-rata 6 bulan terakhir: <strong>{recentAvg}%</strong>
        </span>
        {delta != null && (
          <span>
            Perubahan terbaru: {delta > 0 ? "+" : ""}
            {delta}% dibanding bulan sebelumnya
          </span>
        )}
      </div>
    </section>
  );
};

const ManagementDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [partial, setPartial] = useState(false);
  const [data, setData] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const { start } = getWeekBounds(new Date());
    return formatISO(start);
  });
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    () => new Date().getFullYear()
  );

  const yearNumber = Number.isFinite(Number(selectedYear))
    ? Number(selectedYear)
    : new Date().getFullYear();

  const weekOptions = useMemo(() => {
    const options = [];
    const januaryFirst = new Date(yearNumber, 0, 1);
    januaryFirst.setHours(0, 0, 0, 0);
    const endOfYear = new Date(yearNumber, 11, 31);
    endOfYear.setHours(0, 0, 0, 0);

    let cursor = new Date(januaryFirst);
    let guard = 0;
    while (guard < 60) {
      const { start, end } = getWeekBounds(cursor);
      if (end < januaryFirst) {
        cursor.setDate(cursor.getDate() + 7);
        guard += 1;
        continue;
      }
      if (start > endOfYear) break;
      options.push({
        value: formatISO(start),
        label: `${formatDate(start)} - ${formatDate(end)}`,
      });
      cursor.setDate(cursor.getDate() + 7);
      guard += 1;
    }

    if (!options.length) {
      const { start, end } = getWeekBounds(new Date());
      options.push({
        value: formatISO(start),
        label: `${formatDate(start)} - ${formatDate(end)}`,
      });
    }

    if (selectedWeek) {
      const selectedDate = new Date(selectedWeek);
      if (!Number.isNaN(selectedDate.getTime())) {
        const { start, end } = getWeekBounds(selectedDate);
        const value = formatISO(start);
        if (!options.some((opt) => opt.value === value)) {
          options.push({
            value,
            label: `${formatDate(start)} - ${formatDate(end)}`,
          });
        }
      }
    }

    return options.sort((a, b) => a.value.localeCompare(b.value));
  }, [selectedWeek, yearNumber]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const baseYears = Array.from({ length: 5 }, (_, index) => currentYear - index);
    if (!baseYears.includes(yearNumber)) baseYears.push(yearNumber);
    return baseYears.sort((a, b) => b - a);
  }, [yearNumber]);

  const handleMonthChange = (value) => {
    if (!value) {
      setSelectedMonth(new Date().getMonth() + 1);
      return;
    }
    setSelectedMonth(Number(value));
  };

  const fetchDashboardData = useCallback(async () => {
    let partialFlag = false;
    const markPartial = () => {
      partialFlag = true;
    };

    let weekDate = selectedWeek ? new Date(selectedWeek) : new Date();
    if (Number.isNaN(weekDate.getTime())) weekDate = new Date();
    const { start: weekStart, end: weekEnd } = getWeekBounds(weekDate);
    const minggu = formatISO(weekStart);

    const parsedMonth = Number.parseInt(selectedMonth, 10);
    const month = Number.isFinite(parsedMonth)
      ? Math.min(Math.max(parsedMonth, 1), 12)
      : new Date().getMonth() + 1;
    const year = yearNumber;

    const fetchTeams = async () => {
      try {
        const res = await axios.get("/teams/all");
        const arr = Array.isArray(res.data) ? res.data : [];
        if (arr.length) return arr;
      } catch (err) {
        markPartial();
        if (err?.response?.status === 403) throw err;
      }
      try {
        const res = await axios.get("/teams");
        const arr = Array.isArray(res.data) ? res.data : [];
        if (arr.length) return arr;
      } catch (err) {
        markPartial();
        if (err?.response?.status === 403) throw err;
      }
      try {
        const res = await axios.get("/teams/member");
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        markPartial();
        if (err?.response?.status === 403) throw err;
      }
      return [];
    };

    const fetchAssignments = async () => {
      try {
        const res = await axios.get("/penugasan", {
          params: { bulan: month, tahun: year },
        });
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        markPartial();
        if (err?.response?.status === 403) throw err;
        handleAxiosError(err, "Gagal mengambil data penugasan");
        return [];
      }
    };

    const fetchWeekly = async () => {
      try {
        const res = await axios.get("/monitoring/mingguan/all", {
          params: { minggu },
        });
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        markPartial();
        if (err?.response?.status === 403) throw err;
        handleAxiosError(err, "Gagal mengambil data mingguan");
        return [];
      }
    };

    const fetchMonthly = async () => {
      try {
        const res = await axios.get("/monitoring/bulanan/all", {
          params: { year, bulan: String(month) },
        });
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        markPartial();
        if (err?.response?.status === 403) throw err;
        handleAxiosError(err, "Gagal mengambil data bulanan");
        return [];
      }
    };

    const fetchYearly = async () => {
      try {
        const res = await axios.get("/monitoring/bulanan/matrix", {
          params: { year },
        });
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        markPartial();
        if (err?.response?.status === 403) throw err;
        handleAxiosError(err, "Gagal mengambil data tahunan");
        return [];
      }
    };

    const [teams, assignments, weekly, monthly, yearlyMatrix] =
      await Promise.all([
        fetchTeams(),
        fetchAssignments(),
        fetchWeekly(),
        fetchMonthly(),
        fetchYearly(),
      ]);

    const { teamMap } = collectTeamMappings(teams);
    const topActivities = computeTopActivities(assignments);
    const weeklyTeams = aggregateTeamPerformance(weekly, teamMap);
    const monthlyTeams = aggregateTeamPerformance(monthly, teamMap);
    const yearlyTeams = aggregateYearlyPerformance(yearlyMatrix, teamMap);
    const trends = computeTrends(yearlyMatrix);

    const collectiveWeekly = summarizeTeamList(weeklyTeams);
    const collectiveMonthly = summarizeTeamList(monthlyTeams);
    const yearlyProgressValues = trends
      .map((t) => t.value)
      .filter((val) => Number.isFinite(val) && val > 0);
    const collectiveYearlyProgress = yearlyProgressValues.length
      ? Math.round(
          yearlyProgressValues.reduce((sum, val) => sum + val, 0) /
            yearlyProgressValues.length
        )
      : 0;

    const highlights = {
      activeAssignments: assignments.filter(
        (item) => item?.status !== STATUS.SELESAI_DIKERJAKAN
      ).length,
      backlog: assignments.filter((item) => item?.status === STATUS.BELUM)
        .length,
      completedThisWeek: collectiveWeekly.selesai,
      weeklyProgress: collectiveWeekly.progress,
      monthlyProgress: collectiveMonthly.progress,
      yearlyProgress: collectiveYearlyProgress,
    };

    const collective = {
      weekly: collectiveWeekly,
      monthly: collectiveMonthly,
      yearly: {
        progress: collectiveYearlyProgress,
        bestTeam: yearlyTeams[0] || null,
        lowestTeam:
          yearlyTeams.length > 1 ? yearlyTeams[yearlyTeams.length - 1] : null,
      },
      insights: buildInsights({
        topActivities,
        collectiveWeekly,
        collectiveMonthly,
        yearlyTeams,
      }),
    };

    const monthIndex = month - 1;
    const weekLabel = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    const monthLabel =
      monthIndex >= 0 && monthIndex < months.length
        ? `${months[monthIndex]} ${year}`
        : String(year);

    return {
      partialFlag,
      payload: {
        topActivities,
        teamPerformance: {
          weekly: weeklyTeams,
          monthly: monthlyTeams,
          yearly: yearlyTeams,
        },
        highlights,
        collective,
        trends,
        period: {
          weekLabel,
          monthLabel,
          year,
        },
      },
    };
  }, [selectedMonth, selectedWeek, yearNumber]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError("");
      setPartial(false);

      try {
        const result = await fetchDashboardData();
        if (!isMounted) return;
        setData(result.payload);
        setPartial(result.partialFlag);
      } catch (err) {
        if (!isMounted) return;
        setPartial(true);
        if (err?.response?.status === 403) {
          setError("Anda tidak memiliki akses untuk melihat dashboard pimpinan.");
        } else {
          setError("Gagal memuat data dashboard pimpinan.");
          if (err) handleAxiosError(err, "Gagal memuat dashboard pimpinan");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData, user?.id]);

  const leadingTeam = useMemo(() => {
    if (!data?.teamPerformance?.weekly?.length) return null;
    return [...data.teamPerformance.weekly].sort(
      (a, b) => b.progress - a.progress
    )[0];
  }, [data]);

  if (loading) return <Loading fullScreen />;
  if (error)
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        {error}
      </div>
    );

  if (!data)
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Tidak ada data untuk ditampilkan.
      </div>
    );

  const {
    highlights,
    period,
    topActivities,
    teamPerformance,
    collective,
    trends,
  } = data;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in">
      <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white rounded-3xl shadow-lg p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'%3E%3Cstop stop-color='%23ffffff' stop-opacity='0.1' offset='0%'/%3E%3Cstop stop-color='%23ffffff' stop-opacity='0' offset='100%'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='400' height='400'/%3E%3C/svg%3E\")",
          }}
          aria-hidden="true"
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-blue-100">
              Dashboard
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold mt-2">
              Selamat datang, {user?.nama || "Pimpinan"}!
            </h1>
          </div>
          {leadingTeam && (
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 min-w-[220px]">
              <p className="text-xs uppercase tracking-widest text-blue-100">
                Tim dengan Capaian Tertinggi Minggu Ini
              </p>
              <p className="text-lg font-semibold">{leadingTeam.name}</p>
              <p className="text-3xl font-bold">{leadingTeam.progress}%</p>
              <p className="text-xs text-blue-100">
                {leadingTeam.status.label}
              </p>
            </div>
          )}
        </div>
      </section>

      {partial && (
        <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-100 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          Sebagian data gagal dimuat. Informasi yang ditampilkan mungkin belum
          lengkap.
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <HighlightCard
          icon={ClipboardList}
          title="Penugasan Aktif"
          value={numberFormatter.format(highlights.activeAssignments)}
          description="Total penugasan yang sedang berjalan"
          accent="bg-white/90 text-blue-600"
        />
        <HighlightCard
          icon={CheckCircle2}
          title="Selesai Minggu Ini"
          value={numberFormatter.format(highlights.completedThisWeek)}
          description={`Capaian periode ${period.weekLabel}`}
          accent="bg-emerald-100 text-emerald-700"
        />
        <HighlightCard
          icon={TrendingUp}
          title="Rata-rata Bulanan"
          value={`${highlights.monthlyProgress}%`}
          description={period.monthLabel}
          accent="bg-blue-100 text-blue-700"
        />
        <HighlightCard
          icon={AlertTriangle}
          title="Backlog"
          value={numberFormatter.format(highlights.backlog)}
          description="Penugasan yang belum tersentuh"
          accent="bg-amber-100 text-amber-700"
        />
      </section>

      <ActivitiesCard activities={topActivities} />
      <TeamPerformanceCard data={teamPerformance} period={period} />
      <CollectivePerformanceCard collective={collective} period={period} />
      <TrendsCard trends={trends} />
    </div>
  );
};

export default ManagementDashboard;
