const WeeklyOverview = ({ data }) => {
  if (!data) return null;

  const formatDate = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  const rangeText = data.tanggal
    .split(" - ")
    .map(formatDate)
    .join(" - ");

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-blue-600 mb-1">
          Progress Mingguan
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Minggu {data.minggu} Bulan {data.bulan}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{rangeText}</p>
        <div className="mt-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-blue-700 dark:text-blue-300">
              {data.totalProgress}% selesai
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              ({data.totalSelesai}/{data.totalTugas})
            </span>
          </div>
          <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full mt-1">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${data.totalProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.detail?.map((day, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow"
          >
            <div className="flex justify-between text-sm">
              <span>
                {day.hari}, {formatDate(day.tanggal)}
              </span>
              <span>
                {day.selesai}/{day.total} &nbsp; {day.persen}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full mt-1">
              <div
                className="h-2 bg-blue-500 rounded-full"
                style={{ width: `${day.persen}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyOverview;
