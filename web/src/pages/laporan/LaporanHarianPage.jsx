import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Search } from "lucide-react";
import Swal from "sweetalert2";
import Pagination from "../../components/Pagination";

export default function LaporanHarianPage() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    tanggal: new Date().toISOString().slice(0, 10),
    status: "Belum",
    bukti_link: "",
    catatan: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/laporan-harian/mine");
      setLaporan(res.data);
    } catch (err) {
      console.error("Gagal mengambil laporan", err);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (item) => {
    setForm({
      id: item.id,
      tanggal: item.tanggal.slice(0, 10),
      status: item.status,
      bukti_link: item.bukti_link || "",
      catatan: item.catatan || "",
    });
    setShowForm(true);
  };

  const saveForm = async () => {
    try {
      if (form.id) {
        await axios.put(`/laporan-harian/${form.id}`, form);
      }
      setShowForm(false);
      fetchData();
      Swal.fire("Berhasil", "Laporan diperbarui", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menyimpan", "error");
    }
  };

  const remove = async (id) => {
    const r = await Swal.fire({
      title: "Hapus laporan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/laporan-harian/${id}`);
      fetchData();
      Swal.fire("Dihapus", "Laporan dihapus", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menghapus", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = laporan.filter((l) => {
    const peg = l.pegawai?.nama?.toLowerCase() || "";
    const keg = l.penugasan?.kegiatan?.nama_kegiatan?.toLowerCase() || "";
    const cat = l.catatan?.toLowerCase() || "";
    const stat = l.status.toLowerCase();
    const txt = `${peg} ${keg} ${cat} ${stat}`;
    return txt.includes(query.toLowerCase());
  });
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(laporan.length / pageSize) || 1;

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
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
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
        <>
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search
                    size={16}
                    className="text-gray-400 dark:text-gray-300"
                  />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari laporan..."
                  className="w-full border rounded-md py-[4px] pl-10 pr-3 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="px-3 py-2 border">No</th>
                  <th className="px-3 py-2 border">Tanggal</th>
                  <th className="px-3 py-2 border">Status</th>
                  <th className="px-3 py-2 border">Bukti</th>
                  <th className="px-3 py-2 border">Catatan</th>
                  <th className="px-3 py-2 border">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((item, idx) => (
                  <tr key={item.id} className="border-t text-center">
                    <td className="px-3 py-1 border">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-3 py-1 border">
                      {item.tanggal.slice(0, 10)}
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
                    <td className="px-3 py-1 border space-x-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => remove(item.id)}
                        className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {laporan.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
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
                    <option
                      key={n}
                      value={n}
                      className="text-gray-900 dark:text-gray-200"
                    >
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
        </>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-lg font-semibold">Edit Laporan Harian</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1">
                  Tanggal<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) =>
                    setForm({ ...form, tanggal: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Status<span className="text-red-500">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                >
                  <option value="Belum">Belum</option>
                  <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                  <option value="Selesai Dikerjakan">Selesai Dikerjakan</option>
                </select>
              </div>
              {form.status === "Selesai Dikerjakan" && (
                <div>
                  <label className="block text-sm mb-1">Link Bukti</label>
                  <input
                    type="text"
                    value={form.bukti_link}
                    onChange={(e) =>
                      setForm({ ...form, bukti_link: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm mb-1">Catatan</label>
                <textarea
                  value={form.catatan}
                  onChange={(e) =>
                    setForm({ ...form, catatan: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
              >
                Batal
              </button>
              <button
                onClick={saveForm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-lg font-semibold">Edit Laporan Harian</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1">
                  Tanggal<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) =>
                    setForm({ ...form, tanggal: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Status<span className="text-red-500">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                >
                  <option value="Belum">Belum</option>
                  <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                  <option value="Selesai Dikerjakan">Selesai Dikerjakan</option>
                </select>
              </div>
              {form.status === "Selesai Dikerjakan" && (
                <div>
                  <label className="block text-sm mb-1">Link Bukti</label>
                  <input
                    type="text"
                    value={form.bukti_link}
                    onChange={(e) =>
                      setForm({ ...form, bukti_link: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm mb-1">Catatan</label>
                <textarea
                  value={form.catatan}
                  onChange={(e) =>
                    setForm({ ...form, catatan: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
              >
                Batal
              </button>
              <button
                onClick={saveForm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
