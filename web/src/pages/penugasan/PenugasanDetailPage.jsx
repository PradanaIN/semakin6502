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
  const [laporan, setLaporan] = useState([]);
  const [showLaporanForm, setShowLaporanForm] = useState(false);
  const [laporanForm, setLaporanForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    status: "Belum", // Belum, Sedang Dikerjakan, Selesai Dikerjakan
    bukti_link: "",
    catatan: "",
  });

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
    axios.get(`/laporan-harian/penugasan/${id}`).then((r) => setLaporan(r.data));
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

  const openLaporan = () => {
    setLaporanForm({
      tanggal: new Date().toISOString().slice(0, 10),
      status: "Belum",
      bukti_link: "",
      catatan: "",
    });
    setShowLaporanForm(true);
  };

  const saveLaporan = async () => {
    try {
      await axios.post("/laporan-harian", { ...laporanForm, penugasanId: id });
      setShowLaporanForm(false);
      const r = await axios.get(`/laporan-harian/penugasan/${id}`);
      setLaporan(r.data);
      Swal.fire("Berhasil", "Laporan ditambah", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menambah laporan", "error");
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
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Laporan Harian</h3>
          <button
            onClick={openLaporan}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Tambah
          </button>
        </div>
        <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-center text-sm">
              <th className="px-2 py-1">Tanggal</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Bukti</th>
              <th className="px-2 py-1">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {laporan.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-2 text-center">
                  Belum ada laporan
                </td>
              </tr>
            ) : (
              laporan.map((l) => (
                <tr
                  key={l.id}
                  className="border-t dark:border-gray-700 text-center"
                >
                  <td className="px-2 py-1">{l.tanggal.slice(0, 10)}</td>
                  <td className="px-2 py-1">{l.status}</td>
                  <td className="px-2 py-1">
                    {l.bukti_link ? (
                      <a
                        href={l.bukti_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        Link
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-2 py-1">{l.catatan || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showLaporanForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-lg font-semibold">Tambah Laporan Harian</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1">Tanggal</label>
                <input
                  type="date"
                  value={laporanForm.tanggal}
                  onChange={(e) =>
                    setLaporanForm({ ...laporanForm, tanggal: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Status</label>
                <select
                  value={laporanForm.status}
                  onChange={(e) =>
                    setLaporanForm({ ...laporanForm, status: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                >
                  <option value="Belum">Belum</option>
                  <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                  <option value="Selesai Dikerjakan">Selesai Dikerjakan</option>
                </select>
              </div>
              {laporanForm.status === "Selesai Dikerjakan" && (
                <div>
                  <label className="block text-sm mb-1">Link Bukti</label>
                  <input
                    type="text"
                    value={laporanForm.bukti_link}
                    onChange={(e) =>
                      setLaporanForm({
                        ...laporanForm,
                        bukti_link: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm mb-1">Catatan</label>
                <textarea
                  value={laporanForm.catatan}
                  onChange={(e) =>
                    setLaporanForm({ ...laporanForm, catatan: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowLaporanForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
              >
                Batal
              </button>
              <button
                onClick={saveLaporan}
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
