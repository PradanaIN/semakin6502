const WeeklyOverview = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-purple-600 mb-1">
          Progress Mingguan
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {data.minggu} Bulan {data.bulan} ({data.tanggal})
        </p>
        <p className="text-lg font-semibold text-purple-700 dark:text-purple-300 mt-2">
          {data.totalProgress}% selesai ({data.totalSelesai}/{data.totalTugas})
        </p>
      </div>

      <div className="space-y-3">
        {data.detail?.map((day, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm">
              <span>
                {day.hari} ({day.tanggal})
              </span>
              <span>
                {day.selesai}/{day.total} &nbsp; {day.persen}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full">
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
