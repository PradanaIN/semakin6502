import { CheckCircle, Clock, ClipboardList, Calendar } from "lucide-react";

const StatsSummary = ({ weeklyData, reportedToday = false, countOverride = null, activeDate = null }) => {
  if (!weeklyData) return null;

  // Laporan Hari Ini hanya dihitung jika activeDate diberikan (view periode saat ini)
  let laporanHariIni = 0;
  if (activeDate) {
    const today = weeklyData.detail?.find((d) => d.tanggal === activeDate) || {};
    const selesaiToday = Number(today.selesai) || 0;
    const sedangToday = Number(today.sedang ?? today.proses ?? 0) || 0;
    const derivedInProgress =
      today.total !== undefined && today.belum !== undefined
        ? Math.max((Number(today.total) || 0) - (Number(today.belum) || 0) - selesaiToday, 0)
        : 0;
    laporanHariIni = selesaiToday + (sedangToday || derivedInProgress);
    if (!laporanHariIni && reportedToday) laporanHariIni = 1;
    if (typeof countOverride === "number") laporanHariIni = countOverride;
  }
  const pen = weeklyData.penugasan || {};
  const tambahan = weeklyData.tambahan || {};
  const tugasMingguIni = (pen.total || 0) + (tambahan.total || 0);
  const selesai = (pen.selesai || 0) + (tambahan.selesai || 0);
  const belumPen =
    pen.belum !== undefined ? pen.belum : Math.max((pen.total || 0) - (pen.selesai || 0), 0);
  const belumTambahan =
    tambahan.belum !== undefined
      ? tambahan.belum
      : Math.max((tambahan.total || 0) - (tambahan.selesai || 0), 0);
  const belumSelesai = Math.max(belumPen + belumTambahan, 0);

  const statBox =
    "p-4 rounded-xl shadow-md text-center transition hover:shadow-lg";
  const labelStyle = "text-sm text-gray-600 dark:text-gray-300";
  const valueStyle = "text-3xl font-bold";

  const statList = [
    {
      label: "Laporan Hari Ini",
      value: laporanHariIni,
      bg: "bg-blue-50 dark:bg-blue-900",
      color: "text-blue-600 dark:text-blue-200",
      icon: <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-300" />,
    },
    {
      label: "Tugas Minggu Ini",
      value: tugasMingguIni,
      bg: "bg-indigo-50 dark:bg-indigo-900",
      color: "text-indigo-600 dark:text-indigo-200",
      icon: (
        <ClipboardList className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
      ),
    },
    {
      label: "Belum Selesai",
      value: belumSelesai,
      bg: "bg-yellow-50 dark:bg-yellow-900",
      color: "text-yellow-600 dark:text-yellow-200",
      icon: <Clock className="w-5 h-5 text-yellow-500 dark:text-yellow-300" />,
    },
    {
      label: "Selesai",
      value: selesai,
      bg: "bg-green-50 dark:bg-green-900",
      color: "text-green-600 dark:text-green-200",
      icon: (
        <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-300" />
      ),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statList.map(({ label, value, bg, color, icon }) => (
        <div key={label} className={`${statBox} ${bg}`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            {icon}
            <span className={labelStyle}>{label}</span>
          </div>
          <p className={`${valueStyle} ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsSummary;
