import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";
import { Pencil, Trash2 } from "lucide-react";

const selectStyles = {
  option: (base) => ({ ...base, color: "#000" }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export default function PenugasanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [kegiatan, setKegiatan] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    kegiatanId: "",
    pegawaiId: "",
    deskripsi: "",
    minggu: 1,
    bulan: 1,
    tahun: new Date().getFullYear(),
    status: "Belum",
  });
  const [editing, setEditing] = useState(false);

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`/penugasan/${id}`);
      setItem(res.data);
      setForm({
        kegiatanId: res.data.kegiatanId,
        pegawaiId: res.data.pegawaiId,
        deskripsi: res.data.deskripsi || "",
        minggu: res.data.minggu,
        bulan: parseInt(res.data.bulan, 10) || 1,
        tahun: res.data.tahun,
        status: res.data.status,
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal mengambil data", "error");
    }
  };

  useEffect(() => {
    fetchDetail();
    axios.get("/master-kegiatan").then((r) => {
      const kData = r.data.data || r.data;
      const sorted = [...kData].sort((a, b) =>
        a.nama_kegiatan.localeCompare(b.nama_kegiatan)
      );
      setKegiatan(sorted);
    });
    axios.get("/users").then((r) => {
      const sorted = [...r.data].sort((a, b) => a.nama.localeCompare(b.nama));
      setUsers(sorted);
    });
  }, [id]);

  const save = async () => {
    try {
      await axios.put(`/penugasan/${id}`, form);
      Swal.fire("Berhasil", "Penugasan diperbarui", "success");
      setEditing(false);
      fetchDetail();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal memperbarui", "error");
    }
  };

  const remove = async () => {
    const r = await Swal.fire({
      title: "Hapus penugasan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/penugasan/${id}`);
      Swal.fire("Dihapus", "Penugasan dihapus", "success");
      navigate(-1);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menghapus", "error");
    }
  };

  if (!item) return <div className="p-6">Memuat...</div>;

  return (
    <div className="p-6 space-y-4">
      {!editing ? (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Detail Penugasan</h2>
          <p>Kegiatan: {item.kegiatan?.nama_kegiatan}</p>
          <p>Tim: {item.kegiatan?.team?.nama_tim}</p>
          <p>Pegawai: {item.pegawai?.nama}</p>
          <p>Minggu: {item.minggu}</p>
          <p>Bulan: {item.bulan}</p>
          <p>Tahun: {item.tahun}</p>
          <p>Deskripsi: {item.deskripsi || "-"}</p>
          <p>Status: {item.status}</p>
          <div className="space-x-2 pt-2">
            <button
              onClick={() => setEditing(true)}
              className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={remove}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Edit Penugasan</h2>
          <div>
            <label className="block text-sm mb-1">Kegiatan</label>
            <Select
              classNamePrefix="react-select"
              styles={selectStyles}
              menuPortalTarget={document.body}
              options={kegiatan.map((k) => ({ value: k.id, label: k.nama_kegiatan }))}
              value={{
                value: form.kegiatanId,
                label:
                  kegiatan.find((k) => k.id === form.kegiatanId)?.nama_kegiatan || "",
              }}
              onChange={(o) =>
                setForm({ ...form, kegiatanId: o ? parseInt(o.value, 10) : "" })
              }
              isSearchable
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Pegawai</label>
            <Select
              classNamePrefix="react-select"
              styles={selectStyles}
              menuPortalTarget={document.body}
              options={users
                .filter((u) => u.role !== "admin")
                .map((u) => ({ value: u.id, label: u.nama }))}
              value={{
                value: form.pegawaiId,
                label: users.find((u) => u.id === form.pegawaiId)?.nama || "",
              }}
              onChange={(o) =>
                setForm({ ...form, pegawaiId: o ? parseInt(o.value, 10) : "" })
              }
              isSearchable
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
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm mb-1">Minggu</label>
              <input
                type="number"
                value={form.minggu}
                min="1"
                max="5"
                onChange={(e) =>
                  setForm({ ...form, minggu: parseInt(e.target.value, 10) })
                }
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Bulan</label>
              <select
                value={form.bulan}
                onChange={(e) =>
                  setForm({ ...form, bulan: parseInt(e.target.value, 10) })
                }
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              >
                {months.map((m, i) => (
                  <option key={i + 1} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Tahun</label>
              <input
                type="number"
                value={form.tahun}
                onChange={(e) =>
                  setForm({ ...form, tahun: parseInt(e.target.value, 10) })
                }
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
            >
              Batal
            </button>
            <button
              onClick={save}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Simpan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
