const MonthlyOverview = ({ data = [] }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">
        Capaian Kinerja Bulanan
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {data.map((item) => (
          <div
            key={item.bulan}
            className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900 text-center"
          >
            <div className="font-medium">{item.bulan}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {item.persen}%
            </div>
            <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full mt-1">
              <div
                className="h-2 bg-blue-500 rounded-full"
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
