import React from "react";

const StatsSummary = ({ weeklyData }) => {
  if (!weeklyData) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const today = weeklyData.detail?.find((d) => d.tanggal === todayStr) || {};

  const tugasHariIni = today.selesai || 0;
  const pen = weeklyData.penugasan || {};
  const tugasMingguIni = pen.total || 0;
  const selesai = pen.selesai || 0;
  const belumSelesai =
    pen.belum !== undefined ? pen.belum : Math.max(tugasMingguIni - selesai, 0);

  const statStyle = "p-4 rounded-lg shadow text-center";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className={`${statStyle} bg-blue-50 dark:bg-blue-900`}>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Tugas Hari Ini
        </p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-200">
          {tugasHariIni}
        </p>
      </div>
      <div className={`${statStyle} bg-indigo-50 dark:bg-indigo-900`}>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Tugas Minggu Ini
        </p>
        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-200">
          {tugasMingguIni}
        </p>
      </div>
      <div className={`${statStyle} bg-yellow-50 dark:bg-yellow-900`}>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Belum Selesai
        </p>
        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-200">
          {belumSelesai}
        </p>
      </div>
      <div className={`${statStyle} bg-green-50 dark:bg-green-900`}>
        <p className="text-sm text-gray-600 dark:text-gray-300">Selesai</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-200">
          {selesai}
        </p>
      </div>
    </div>
  );
};

export default StatsSummary;
