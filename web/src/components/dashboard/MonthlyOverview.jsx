const MonthlyOverview = ({ data = [] }) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-indigo-600">
        Aktivitas Bulanan
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="p-3 rounded-lg text-center bg-white dark:bg-gray-800 shadow"
          >
            <div className="font-semibold mb-1">{monthNames[item.bulan - 1]}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {item.persen}% selesai
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
              <div
                className="h-2 bg-indigo-500 rounded-full"
                style={{ width: `${item.persen}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyOverview;
