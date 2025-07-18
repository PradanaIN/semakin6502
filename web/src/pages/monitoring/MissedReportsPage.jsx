import { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";

export default function MissedReportsPage() {
  const [data, setData] = useState({ day1: [], day3: [], day7: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/monitoring/laporan/terlambat");
        setData(res.data);
      } catch {
        // ignore errors for now
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderList = (items) =>
    items.length > 0 ? (
      <ul className="list-disc pl-5 space-y-1">
        {items.map((u) => (
          <li key={u.userId}>{u.nama}</li>
        ))}
      </ul>
    ) : (
      <div className="text-sm text-gray-500">Tidak ada</div>
    );

  if (loading) return <Skeleton className="h-40" />;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <AlertCircle className="w-5 h-5" /> Ketepatan Laporan
      </h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-4 rounded-lg shadow text-center bg-red-50 dark:bg-red-900">
          <p className="text-sm text-gray-600 dark:text-gray-300">Terlambat 1 Hari</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-200">{data.day1.length}</p>
        </div>
        <div className="p-4 rounded-lg shadow text-center bg-orange-50 dark:bg-orange-900">
          <p className="text-sm text-gray-600 dark:text-gray-300">Terlambat 3 Hari</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-200">{data.day3.length}</p>
        </div>
        <div className="p-4 rounded-lg shadow text-center bg-yellow-50 dark:bg-yellow-900">
          <p className="text-sm text-gray-600 dark:text-gray-300">Terlambat 7 Hari</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-200">{data.day7.length}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Terlambat 1 Hari ({data.day1.length})</h2>
          {renderList(data.day1)}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Terlambat 3 Hari ({data.day3.length})</h2>
          {renderList(data.day3)}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Terlambat 7 Hari ({data.day7.length})</h2>
          {renderList(data.day7)}
        </div>
      </div>
    </div>
  );
}
