import React from "react";

const StatsSummary = ({ weeklyData, monthlyData }) => {
  if (!weeklyData || !monthlyData) return null;

  const totalTasks = weeklyData.totalTugas || 0;
  const completed = weeklyData.totalSelesai || 0;
  const pending = Math.max(totalTasks - completed, 0);
  const activeMonths = monthlyData.filter((m) => m.adaAktivitas).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg shadow text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">Tugas Minggu Ini</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-200">
          {totalTasks}
        </p>
      </div>
      <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg shadow text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">Selesai</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-200">
          {completed}
        </p>
      </div>
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg shadow text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">Belum Selesai</p>
        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-200">
          {pending}
        </p>
      </div>
      <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg shadow text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">Bulan Aktif</p>
        <p className="text-2xl font-bold text-purple-600 dark:text-purple-200">
          {activeMonths}
        </p>
      </div>
    </div>
  );
};

export default StatsSummary;
