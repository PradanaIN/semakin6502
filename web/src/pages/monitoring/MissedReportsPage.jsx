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

  const formatDate = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  const daysLate = (iso) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(iso);
    d.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - d.getTime()) / 86400000);
  };

  const renderList = (items) =>
    items.length > 0 ? (
      <ul className="list-disc pl-5 space-y-1">
        {items.map((u) => (
          <li key={u.userId}>
            {u.nama} -
            {u.lastDate
              ? ` ${daysLate(u.lastDate)} hari (${formatDate(u.lastDate)})`
              : " belum pernah"}
          </li>
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
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <h2 className="font-semibold mb-2">Terlambat 1 Hari</h2>
          {renderList(data.day1)}
        </div>
        <div>
          <h2 className="font-semibold mb-2">Terlambat 3 Hari</h2>
          {renderList(data.day3)}
        </div>
        <div>
          <h2 className="font-semibold mb-2">Terlambat 7 Hari</h2>
          {renderList(data.day7)}
        </div>
      </div>
    </div>
  );
}
