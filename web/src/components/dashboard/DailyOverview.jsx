const DailyOverview = ({ data = [] }) => {
  if (!Array.isArray(data)) return <p>Data tidak tersedia</p>;

  const today = new Date().toISOString().slice(0, 10);

  const formatDate = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  const HOLIDAYS = [
    "2025-01-01",
    "2025-01-29",
    "2025-03-31",
    "2025-05-01",
    "2025-05-29",
    "2025-06-02",
    "2025-07-17",
    "2025-08-17",
    "2025-09-29",
    "2025-12-25",
  ];

  const isWeekend = (iso) => {
    const d = new Date(iso);
    const g = d.getDay();
    return g === 0 || g === 6;
  };

  const isHoliday = (iso) => HOLIDAYS.includes(iso);

  const boxClass = (day) => {
    if (day.adaKegiatan) {
      return "bg-green-200 border-green-400 dark:bg-green-700 dark:border-green-500";
    }

    if (isWeekend(day.tanggal) || isHoliday(day.tanggal)) {
      return "bg-blue-200 border-blue-400 dark:bg-blue-700 dark:border-blue-500";
    }

    if (day.tanggal < today) {
      return "bg-yellow-200 border-yellow-400 dark:bg-yellow-700 dark:border-yellow-500";
    }
    return "bg-gray-100 dark:bg-gray-700";
  };
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-blue-600">
        Kalender Aktivitas Harian
      </h2>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {data.map((day, index) => {
          const dayName = new Date(day.tanggal).toLocaleDateString("id-ID", {
            weekday: "short",
          });

          const weekend = isWeekend(day.tanggal) || isHoliday(day.tanggal);

          return (
            <div
              key={index}
              className={`p-3 rounded-lg text-center text-sm font-medium border ${boxClass(
                day
              )}`}
            >
              <div className="text-gray-800 dark:text-gray-100">
                {dayName}, {formatDate(day.tanggal)}
              </div>
              {weekend && (
                <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Libur
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-xs text-gray-500 mt-2 space-y-1">
        <div>
          <span className="inline-block w-3 h-3 bg-green-400 rounded-sm mr-1"></span>
          ada laporan
        </div>
        <div>
          <span className="inline-block w-3 h-3 bg-yellow-400 rounded-sm mr-1"></span>
          belum lapor (terlewat)
        </div>
        <div>
          <span className="inline-block w-3 h-3 bg-blue-400 rounded-sm mr-1"></span>
          hari libur/weekend
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        <span className="text-green-600">✔</span> menandakan ada laporan
      </p>
    </div>
  );
};

export default DailyOverview;
