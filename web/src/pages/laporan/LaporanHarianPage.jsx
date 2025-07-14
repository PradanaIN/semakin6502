import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import Pagination from "../../components/Pagination";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import { STATUS } from "../../utils/status";
import StatusBadge from "../../components/ui/StatusBadge";
import SearchInput from "../../components/SearchInput";

export default function LaporanHarianPage() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    tanggal: new Date().toISOString().slice(0, 10),
    status: STATUS.BELUM,
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
    const matchQuery = txt.includes(query.toLowerCase());
    const matchDate = l.tanggal.slice(0, 10) === tanggal;
    return matchQuery && matchDate;
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
          <label htmlFor="filterTanggal" className="block text-sm mb-1">Tanggal</label>
          <input
            id="filterTanggal"
            type="date"
            value={tanggal}
            onChange={(e) => {
              setTanggal(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-1 bg-white dark:bg-gray-700"
          />
        </div>
        <SearchInput
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Cari..."
        />
      </div>
      {loading ? (
        <div>Memuat...</div>
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <SearchInput
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari laporan..."
              />
            </div>
          </div>
          <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-center text-sm uppercase">
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Bukti</th>
                <th className="px-4 py-2">Catatan</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item, idx) => (
                <tr key={item.id} className="border-t dark:border-gray-700 text-center">
                  <td className="px-4 py-2">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-4 py-2">{item.tanggal.slice(0, 10)}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2">{item.catatan || "-"}</td>
                  <td className="px-4 py-2 space-x-1">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                      aria-label="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      aria-label="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {laporan.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-300">
                    Tidak ada laporan
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
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
        </>
      )}
        {showForm && (
          <Modal
            onClose={() => {
              setShowForm(false);
            }}
          >
            <h3 className="text-lg font-semibold">Edit Laporan Harian</h3>
            <div className="space-y-2">
              <div>
                <label htmlFor="tanggal" className="block text-sm mb-1">
                  Tanggal<span className="text-red-500">*</span>
                </label>
                <input
                  id="tanggal"
                  type="date"
                  value={form.tanggal}
                  onChange={(e) =>
                    setForm({ ...form, tanggal: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm mb-1">
                  Status<span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                >
                  <option value={STATUS.BELUM}>{STATUS.BELUM}</option>
                  <option value={STATUS.SEDANG_DIKERJAKAN}>
                    {STATUS.SEDANG_DIKERJAKAN}
                  </option>
                  <option value={STATUS.SELESAI_DIKERJAKAN}>
                    {STATUS.SELESAI_DIKERJAKAN}
                  </option>
                </select>
              </div>
              {form.status === STATUS.SELESAI_DIKERJAKAN && (
                <div>
                  <label htmlFor="bukti_link" className="block text-sm mb-1">Link Bukti</label>
                  <input
                    id="bukti_link"
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
                <label htmlFor="catatan" className="block text-sm mb-1">Catatan</label>
                <textarea
                  id="catatan"
                  value={form.catatan}
                  onChange={(e) =>
                    setForm({ ...form, catatan: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Batal
              </Button>
              <Button onClick={saveForm}>Simpan</Button>
            </div>
          </Modal>
        )}
    </div>
  );
}
