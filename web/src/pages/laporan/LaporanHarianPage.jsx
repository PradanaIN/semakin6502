import { useEffect, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";

export default function LaporanHarianPage() {
  const today = new Date().toISOString().split("T")[0];
  const [tanggal, setTanggal] = useState(today);
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/laporan-harian", { params: { tanggal } });
      setLaporan(res.data);
    } catch (err) {
      console.error("Gagal mengambil laporan", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tanggal]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-end gap-2">
        <div>
          <label className="block text-sm mb-1">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="border rounded px-3 py-1 bg-white dark:bg-gray-700"
          />
        </div>
        <button
          onClick={fetchData}
          className="h-9 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          <Search size={16} />
        </button>
      </div>
      {loading ? (
        <div>Memuat...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-3 py-2 border">Pegawai</th>
                <th className="px-3 py-2 border">Kegiatan</th>
                <th className="px-3 py-2 border">Status</th>
                <th className="px-3 py-2 border">Bukti</th>
                <th className="px-3 py-2 border">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {laporan.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-1 border">{item.pegawai?.nama || "-"}</td>
                  <td className="px-3 py-1 border">
                    {item.penugasan?.kegiatan?.nama_kegiatan || "-"}
                  </td>
                  <td className="px-3 py-1 border">{item.status}</td>
                  <td className="px-3 py-1 border">
                    {item.bukti_link ? (
                      <a
                        href={item.bukti_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Lihat
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-1 border">{item.catatan || "-"}</td>
                </tr>
              ))}
              {laporan.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-4 text-gray-500 dark:text-gray-300"
                  >
                    Tidak ada laporan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
