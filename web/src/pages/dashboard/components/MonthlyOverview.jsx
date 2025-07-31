const MonthlyOverview = ({ data = [] }) => {
  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
        Capaian Kinerja Bulanan
      </h2>

      {/* Grid of Month Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {data.map((item) => {
          const progressColor =
            item.persen >= 85
              ? "text-green-600 dark:text-green-400"
              : item.persen >= 60
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-red-600 dark:text-red-400";

          return (
            <div
              key={item.bulan}
              className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow transition hover:shadow-md"
            >
              <div className="text-base font-semibold text-gray-800 dark:text-gray-100 text-center mb-2">
                {item.bulan}
              </div>
              <div
                className={`text-sm font-medium ${progressColor} text-center`}
              >
                {item.persen}%
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                <div
                  className="h-3 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${item.persen}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyOverview;
