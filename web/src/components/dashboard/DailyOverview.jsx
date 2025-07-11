const DailyOverview = ({ data = [] }) => {
  if (!Array.isArray(data)) return <p>Data tidak tersedia</p>;
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-blue-600">
        Kalender Aktivitas Harian
      </h2>
      <div className="grid grid-cols-7 gap-2">
        {data.map((day, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg text-center text-sm font-medium border ${
              day.adaKegiatan
                ? "bg-green-200 border-green-500"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            <div>{day.tanggal}</div>
            {day.adaKegiatan && (
              <div className="text-green-700 text-xs mt-1">✔</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyOverview;
