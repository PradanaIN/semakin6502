import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";

export default function KegiatanTambahanPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nama: "",
    tanggal: new Date().toISOString().slice(0, 10),
    status: "Belum",
    deskripsi: "",
  });
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/kegiatan-tambahan");
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      nama: "",
      tanggal: new Date().toISOString().slice(0, 10),
      status: "Belum",
      deskripsi: "",
    });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      nama: item.nama,
      tanggal: item.tanggal.slice(0, 10),
      status: item.status,
      deskripsi: item.deskripsi || "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.nama || !form.tanggal) return;
    try {
      if (editing) {
        await axios.put(`/kegiatan-tambahan/${editing.id}`, form);
      } else {
        await axios.post("/kegiatan-tambahan", form);
      }
      setShowForm(false);
      setEditing(null);
      fetchData();
      Swal.fire("Berhasil", "Data disimpan", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menyimpan", "error");
    }
  };

  const remove = async (item) => {
    const r = await Swal.fire({
      title: "Hapus kegiatan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/kegiatan-tambahan/${item.id}`);
      fetchData();
      Swal.fire("Dihapus", "Kegiatan dihapus", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menghapus", "error");
    }
  };

  const openDetail = (id) => {
    navigate(`/tugas-tambahan/${id}`);
  };

  const filtered = items.filter(
    (i) =>
      i.nama.toLowerCase().includes(search.toLowerCase()) ||
      i.status.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2 flex-wrap">
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
              placeholder="Cari kegiatan..."
              className="w-full border rounded-md py-[4px] pl-10 pr-3 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus size={16} /> Tambah
        </button>
      </div>

      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-center text-sm uppercase">
            <th className="px-4 py-2">No</th>
            <th className="px-4 py-2">Nama</th>
            <th className="px-4 py-2">Tanggal</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="py-4 text-center">
                Memuat data...
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-4 text-center">
                Data tidak ditemukan
              </td>
            </tr>
          ) : (
            paginated.map((item, idx) => (
              <tr key={item.id} className="border-t dark:border-gray-700 text-center">
                <td className="px-4 py-2">{(currentPage - 1) * pageSize + idx + 1}</td>
                <td className="px-4 py-2">{item.nama}</td>
                <td className="px-4 py-2">{item.tanggal.slice(0,10)}</td>
                <td className="px-4 py-2">{item.status}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => openDetail(item.id)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => remove(item)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between mt-4">
        <div className="space-x-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200"
          >
            {[5, 10, 25].map((n) => (
              <option key={n} value={n} className="text-gray-900 dark:text-gray-200">
                {n}
              </option>
            ))}
          </select>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-2">
              {editing ? "Edit Kegiatan" : "Tambah Kegiatan"}
            </h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1">Nama</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Tanggal</label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Status</label>
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
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
              >
                Batal
              </button>
              <button onClick={save} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
