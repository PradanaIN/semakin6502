import { useEffect, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import Pagination from "../../components/Pagination";

export default function LaporanHarianPage() {
  const today = new Date().toISOString().split("T")[0];
  const [tanggal, setTanggal] = useState(today);
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  const filtered = laporan.filter((l) => {
    const peg = l.pegawai?.nama?.toLowerCase() || "";
    const keg = l.penugasan?.kegiatan?.nama_kegiatan?.toLowerCase() || "";
    const cat = l.catatan?.toLowerCase() || "";
    const stat = l.status.toLowerCase();
    const txt = `${peg} ${keg} ${cat} ${stat}`;
    return txt.includes(search.toLowerCase());
  });
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-sm mb-1">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => {
              setTanggal(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-1 bg-white dark:bg-gray-700"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400 dark:text-gray-300" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari..."
            className="pl-10 pr-3 py-1 border rounded bg-white dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
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
              {paginated.map((item) => (
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
              {filtered.length === 0 && (
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
          <div className="flex items-center justify-between mt-2">
            <div className="space-x-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10));
                  setCurrentPage(1);
                }}
                className="border rounded px-3 py-1 bg-white dark:bg-gray-700 dark:text-gray-200"
              >
                {[5, 10, 25].map((n) => (
                  <option key={n} value={n} className="text-gray-900 dark:text-gray-200">
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
