const MonthlyOverview = ({ data = [] }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-indigo-600">
        Aktivitas Bulanan
      </h2>
      <div className="grid grid-cols-5 gap-3">
        {data.map((item, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg text-center text-sm font-medium border ${
              item.adaAktivitas
                ? "bg-blue-100 border-blue-500"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            <div>{item.tanggal}</div>
            {item.adaAktivitas && (
              <div className="text-blue-700 text-xs mt-1">✔</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyOverview;
