const MonthlyOverview = ({ data = [] }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-blue-600">
        Capaian Kinerja Bulanan
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {data.map((item, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg text-center font-medium ${
              item.adaAktivitas
                ? "bg-blue-50 dark:bg-blue-900"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            <div>{item.tanggal}</div>
            {item.adaAktivitas && (
              <div className="text-blue-600 dark:text-blue-300 text-sm mt-1">✔</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyOverview;
