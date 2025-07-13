const DailyOverview = ({ data = [] }) => {
  if (!Array.isArray(data)) return <p>Data tidak tersedia</p>;

  const today = new Date().toISOString().slice(0, 10);

  const formatDate = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  const boxClass = (day) => {
    if (day.adaKegiatan) {
      return "bg-green-200 border-green-400 dark:bg-green-700 dark:border-green-500";
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
      </div>
    </div>
  );
};

export default DailyOverview;
