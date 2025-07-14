import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Table from "../../components/ui/Table";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { STATUS } from "../../utils/status";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";

const selectStyles = {
  option: (base) => ({ ...base, color: "#000" }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export default function KegiatanTambahanPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [kegiatan, setKegiatan] = useState([]);
  const [form, setForm] = useState({
    kegiatanId: "",
    tanggal: new Date().toISOString().slice(0, 10),
    status: STATUS.BELUM,
    deskripsi: "",
  });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, kRes] = await Promise.all([
        axios.get("/kegiatan-tambahan"),
        axios.get("/master-kegiatan?limit=1000"),
      ]);
      setItems(tRes.data);
      setKegiatan(kRes.data.data || kRes.data);
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
      kegiatanId: "",
      tanggal: new Date().toISOString().slice(0, 10),
      status: STATUS.BELUM,
      deskripsi: "",
    });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      kegiatanId: item.kegiatanId,
      tanggal: item.tanggal.slice(0, 10),
      status: item.status,
      deskripsi: item.deskripsi || "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.kegiatanId || !form.tanggal) return;
    try {
      const payload = { ...form };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });
      if (editing) {
        await axios.put(`/kegiatan-tambahan/${editing.id}`, payload);
      } else {
        await axios.post("/kegiatan-tambahan", payload);
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
    navigate(`/kegiatan-tambahan/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Kegiatan Tambahan</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus size={16} /> Tambah
        </button>
      </div>

      <Table>
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-center text-sm uppercase">
            <th className="px-4 py-2">No</th>
            <th className="px-4 py-2">Nama</th>
            <th className="px-4 py-2">Tim</th>
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
          ) : items.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-4 text-center">
                Data tidak ditemukan
              </td>
            </tr>
          ) : (
            items.map((item, idx) => (
              <tr key={item.id} className="border-t dark:border-gray-700 text-center">
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{item.nama}</td>
                <td className="px-4 py-2">{item.kegiatan.team?.nama_tim || '-'}</td>
                <td className="px-4 py-2">{item.tanggal.slice(0,10)}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => openDetail(item.id)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    aria-label="Detail"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => remove(item)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
                    aria-label="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
          ))
          )}
        </tbody>
      </Table>

      {showForm && (
        <Modal
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        >
          <h2 className="text-xl font-semibold mb-2">
            {editing ? "Edit Kegiatan" : "Tambah Kegiatan"}
          </h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm mb-1">Kegiatan</label>
              <Select
                classNamePrefix="react-select"
                styles={selectStyles}
                  menuPortalTarget={document.body}
                  options={kegiatan.map((k) => ({ value: k.id, label: k.nama_kegiatan }))}
                  value={
                    form.kegiatanId
                      ? { value: form.kegiatanId, label: kegiatan.find((k) => k.id === form.kegiatanId)?.nama_kegiatan }
                      : null
                  }
                  onChange={(o) => setForm({ ...form, kegiatanId: o ? parseInt(o.value, 10) : "" })}
                  placeholder="Pilih kegiatan..."
                />
                {form.kegiatanId && (
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                    Tim: {kegiatan.find((k) => k.id === form.kegiatanId)?.team?.nama_tim || "-"}
                  </p>
                )}
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
                  <option value={STATUS.BELUM}>{STATUS.BELUM}</option>
                  <option value={STATUS.SEDANG_DIKERJAKAN}>
                    {STATUS.SEDANG_DIKERJAKAN}
                  </option>
                  <option value={STATUS.SELESAI_DIKERJAKAN}>
                    {STATUS.SELESAI_DIKERJAKAN}
                  </option>
                </select>
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
        </Modal>
      )}
    </div>
  );
}
