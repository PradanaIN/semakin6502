import months from "../../../utils/months";
import { CheckCircle, XCircle } from "lucide-react";

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

  // Daily progress rule (binary): any report submitted = 100%, else 0%
  const computePercent = (day) => {
    const total = Number(day.total ?? 0) || 0;
    const ada = Boolean(day.adaKegiatan) || total > 0;
    return ada ? 100 : 0;
  };

  return (
    <div className="space-y-5">
      {/* Section Title */}
      <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
        Capaian Kinerja Mingguan
      </h2>

      {/* Summary Progress Card */}
      <div className="bg-white dark:bg-gray-700 p-5 rounded-xl shadow-md space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm font-medium">
          <span className="text-blue-700 dark:text-blue-300">
            {rangeText}{" "}
            {typeof data?.minggu === "number"
              ? `(Minggu ke-${data.minggu})`
              : ""}
          </span>
          {(() => {
            const persenMinggu = Number(data?.totalProgress || 0);
            return (
              <span className="text-gray-900 dark:text-gray-100 text-base sm:text-lg font-bold">
                {persenMinggu}%
                <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  capaian mingguan
                </span>
              </span>
            );
          })()}
        </div>
        {(() => {
          const selesai = Number(data?.totalSelesai || 0);
          const total = Number(data?.totalTugas || 0);
          const sisa = Math.max(total - selesai, 0);
          return (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-200 text-xs font-semibold">
                Belum: {sisa}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200 text-xs font-semibold">
                Selesai: {selesai}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 text-xs font-semibold">
                Total: {total}
              </span>
            </div>
          );
        })()}
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div
            className="h-3 bg-blue-500 rounded-full transition-all duration-300"
            title={`${Number(data?.totalProgress || 0)}% = ${Number(
              data?.totalSelesai || 0
            )}/${Number(data?.totalTugas || 0)} selesai`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Number(data?.totalProgress || 0)}
            aria-valuetext={`${Number(
              data?.totalProgress || 0
            )} persen capaian mingguan`}
            style={{ width: `${Number(data?.totalProgress || 0)}%` }}
          />
        </div>
      </div>

      {/* Detail Progress per Hari (computed with target per hari) */}
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
                {(() => {
                  const ada = computePercent(day) === 100;
                  return (
                    <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      {ada ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                      )}
                      {ada ? "Ada laporan" : "Tidak ada laporan"}
                    </span>
                  );
                })()}
              </div>
              <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                <div
                  className="h-2.5 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${computePercent(day)}%` }}
                  title={`${day.hari}: ${computePercent(day)}%`}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default WeeklyOverview;
