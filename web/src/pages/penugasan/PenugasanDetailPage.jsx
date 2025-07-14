import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { ROLES } from "../../utils/roles";
import { STATUS } from "../../utils/status";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import months from "../../utils/months";

const selectStyles = {
  option: (base) => ({ ...base, color: "#000" }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export default function PenugasanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = [ROLES.ADMIN, ROLES.KETUA, ROLES.PIMPINAN].includes(user?.role);
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
    status: STATUS.BELUM,
  });
  const [editing, setEditing] = useState(false);
  const [laporan, setLaporan] = useState([]);
  const [showLaporanForm, setShowLaporanForm] = useState(false);
  const [laporanForm, setLaporanForm] = useState({
    id: null,
    tanggal: new Date().toISOString().slice(0, 10),
    status: STATUS.BELUM, // Belum, Sedang Dikerjakan, Selesai Dikerjakan
    bukti_link: "",
    catatan: "",
  });


  const fetchDetail = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchDetail();
    axios
      .get(`/laporan-harian/penugasan/${id}`)
      .then((r) => setLaporan(r.data));
    axios.get("/master-kegiatan").then((r) => {
      const kData = r.data.data || r.data;
      const sorted = [...kData].sort((a, b) =>
        a.nama_kegiatan.localeCompare(b.nama_kegiatan),
      );
      setKegiatan(sorted);
    });

    if (canManage) {
      axios.get("/users").then((r) => {
        const sorted = [...r.data].sort((a, b) => a.nama.localeCompare(b.nama));
        setUsers(sorted);
      });
    } else if (user) {
      setUsers([user]);
    }
  }, [id, canManage, user, fetchDetail]);

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
      id: null,
      tanggal: new Date().toISOString().slice(0, 10),
      status: STATUS.BELUM,
      bukti_link: "",
      catatan: "",
    });
    setShowLaporanForm(true);
  };

  const saveLaporan = async () => {
    try {
      if (laporanForm.id) {
        await axios.put(`/laporan-harian/${laporanForm.id}`, laporanForm);
      } else {
        await axios.post("/laporan-harian", {
          ...laporanForm,
          penugasanId: parseInt(id, 10),
        });
      }
      setShowLaporanForm(false);
      const r = await axios.get(`/laporan-harian/penugasan/${id}`);
      setLaporan(r.data);
      Swal.fire("Berhasil", "Laporan disimpan", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menyimpan laporan", "error");
    }
  };

  const editLaporan = (item) => {
    setLaporanForm({
      id: item.id,
      tanggal: item.tanggal.slice(0, 10),
      status: item.status,
      bukti_link: item.bukti_link || "",
      catatan: item.catatan || "",
    });
    setShowLaporanForm(true);
  };

  const deleteLaporan = async (laporanId) => {
    const r = await Swal.fire({
      title: "Hapus laporan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/laporan-harian/${laporanId}`);
      const res = await axios.get(`/laporan-harian/penugasan/${id}`);
      setLaporan(res.data);
      Swal.fire("Dihapus", "Laporan dihapus", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menghapus laporan", "error");
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Detail Penugasan</h2>
        {canManage && !editing && (
          <div className="space-x-2">
            <button
              onClick={() => setEditing(true)}
              className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
              aria-label="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={remove}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
              aria-label="Hapus"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      {!editing ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div>
            <div className="text-sm text-gray-500">Kegiatan</div>
            <div className="font-medium">{item.kegiatan?.nama_kegiatan}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tim</div>
            <div className="font-medium">{item.kegiatan?.team?.nama_tim}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Pegawai</div>
            <div className="font-medium">{item.pegawai?.nama}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Minggu</div>
            <div className="font-medium">{item.minggu}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Bulan</div>
            <div className="font-medium">{item.bulan}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tahun</div>
            <div className="font-medium">{item.tahun}</div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="text-sm text-gray-500">Deskripsi</div>
            <div className="font-medium">{item.deskripsi || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className="font-medium">
              <StatusBadge status={item.status} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Edit Penugasan</h2>
          <div>
            <label className="block text-sm mb-1">Kegiatan</label>
            <Select
              classNamePrefix="react-select"
              styles={selectStyles}
              menuPortalTarget={document.body}
              options={kegiatan.map((k) => ({
                value: k.id,
                label: k.nama_kegiatan,
              }))}
              value={{
                value: form.kegiatanId,
                label:
                  kegiatan.find((k) => k.id === form.kegiatanId)
                    ?.nama_kegiatan || "",
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
                .filter((u) => u.role !== ROLES.ADMIN)
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
      <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Laporan Harian</h3>
          <button
            onClick={openLaporan}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Tambah
          </button>
        </div>
        <Table className="min-w-full">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-center text-sm">
              <th className="px-2 py-1">No</th>
              <th className="px-2 py-1">Tanggal</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Bukti</th>
              <th className="px-2 py-1">Catatan</th>
              <th className="px-2 py-1">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {laporan.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-2 text-center">
                  Belum ada laporan
                </td>
              </tr>
            ) : (
              laporan.map((l, idx) => (
                <tr
                  key={l.id}
                  className="border-t dark:border-gray-700 text-center"
                >
                  <td className="px-2 py-1">{idx + 1}</td>
                  <td className="px-2 py-1">{l.tanggal.slice(0, 10)}</td>
                  <td className="px-2 py-1">
                    <StatusBadge status={l.status} />
                  </td>
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
                  <td className="px-2 py-1 space-x-1">
                    <button
                      onClick={() => editLaporan(l)}
                      className="p-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                      aria-label="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteLaporan(l.id)}
                      className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      aria-label="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {showLaporanForm && (
        <Modal onClose={() => setShowLaporanForm(false)}>
            <h3 className="text-lg font-semibold">
              {laporanForm.id ? "Edit" : "Tambah"} Laporan Harian
            </h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1">
                  Tanggal<span className="text-red-500">*</span>
                </label>
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
                <label className="block text-sm mb-1">
                  Status<span className="text-red-500">*</span>
                </label>
                <select
                  value={laporanForm.status}
                  onChange={(e) =>
                    setLaporanForm({ ...laporanForm, status: e.target.value })
                  }
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
              {laporanForm.status === STATUS.SELESAI_DIKERJAKAN && (
                <div>
                  <label className="block text-sm mb-1">
                    Link Bukti <span className="text-red-500">*</span>
                  </label>
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
        </Modal>
      )}
    </div>
  );
}
