import months from "../../../utils/months";

const WeeklyOverview = ({ data }) => {
  if (!data) return null;

  const formatDate = (iso) => {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const [startIso, endIso] = data.tanggal.split(" - ");
  const start = new Date(startIso);
  const end = new Date(endIso);
  const monthName = months[start.getMonth()];
  const rangeText = `${start.getDate()} - ${end.getDate()} ${monthName} ${start.getFullYear()}`;

  return (
    <div className="space-y-5">
      {/* Section Title */}
      <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
        Progress Mingguan
      </h2>

      {/* Summary Progress Card */}
      <div className="bg-white dark:bg-gray-700 p-5 rounded-xl shadow-md space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-blue-700 dark:text-blue-300">{rangeText}</span>
          <span className="text-gray-700 dark:text-gray-200">
            {data.totalProgress}% selesai
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div
            className="h-3 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${data.totalProgress}%` }}
          />
        </div>
      </div>

      {/* Detail Progress per Hari */}
      <div className="space-y-3">
        {data.detail
          ?.filter((d) => {
            const dow = new Date(d.tanggal).getDay();
            return (dow >= 1 && dow <= 5) || d.total > 0;
          })
          .map((day) => (
            <div
              key={day.tanggal}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow transition"
            >
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-800 dark:text-gray-100">
                  {day.hari}, {formatDate(day.tanggal)}
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  {day.persen}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                <div
                  className="h-2.5 bg-blue-500 rounded-full transition-all duration-300"
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
