import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  showSuccess,
  showError,
  confirmDelete,
} from "../../utils/alerts";
import Select from "react-select";
import selectStyles from "../../utils/selectStyles";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { ROLES } from "../../utils/roles";
import { STATUS } from "../../utils/status";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import tableStyles from "../../components/ui/Table.module.css";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import months from "../../utils/months";


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
      showError("Error", "Gagal mengambil data");
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
      showSuccess("Berhasil", "Penugasan diperbarui");
      setEditing(false);
      fetchDetail();
    } catch (err) {
      console.error(err);
      showError("Error", "Gagal memperbarui");
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
      showSuccess("Berhasil", "Laporan disimpan");
    } catch (err) {
      console.error(err);
      showError("Error", "Gagal menyimpan laporan");
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
    const r = await confirmDelete("Hapus laporan ini?");
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/laporan-harian/${laporanId}`);
      const res = await axios.get(`/laporan-harian/penugasan/${id}`);
      setLaporan(res.data);
      showSuccess("Dihapus", "Laporan dihapus");
    } catch (err) {
      console.error(err);
      showError("Error", "Gagal menghapus laporan");
    }
  };

  const remove = async () => {
    const r = await confirmDelete("Hapus penugasan ini?");
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/penugasan/${id}`);
      showSuccess("Dihapus", "Penugasan dihapus");
      navigate(-1);
    } catch (err) {
      console.error(err);
      showError("Error", "Gagal menghapus");
    }
  };

  if (!item) return <div className="p-6">Memuat...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Detail Penugasan</h2>
        {canManage && !editing && (
          <div className="space-x-2">
            <Button
              onClick={() => setEditing(true)}
              variant="warning"
              icon
              aria-label="Edit"
            >
              <Pencil size={16} />
            </Button>
            <Button
              onClick={remove}
              variant="danger"
              icon
              aria-label="Hapus"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      </div>
      {!editing ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Kegiatan</div>
            <div className="font-medium">{item.kegiatan?.nama_kegiatan}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Tim</div>
            <div className="font-medium">{item.kegiatan?.team?.nama_tim}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Pegawai</div>
            <div className="font-medium">{item.pegawai?.nama}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Minggu</div>
            <div className="font-medium">{item.minggu}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Bulan</div>
            <div className="font-medium">{item.bulan}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Tahun</div>
            <div className="font-medium">{item.tahun}</div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">Deskripsi</div>
            <div className="font-medium">{item.deskripsi || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
            <div className="font-medium">
              <StatusBadge status={item.status} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Edit Penugasan</h2>
          <div>
            <Label htmlFor="kegiatan">Kegiatan</Label>
            <Select
              inputId="kegiatan"
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
            <Label htmlFor="pegawai">Pegawai</Label>
            <Select
              inputId="pegawai"
              classNamePrefix="react-select"
              styles={selectStyles}
              menuPortalTarget={document.body}
              options={users
                .filter(
                  (u) => u.role !== ROLES.ADMIN && u.role !== ROLES.PIMPINAN
                )
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
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <textarea
              id="deskripsi"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="minggu">Minggu</Label>
              <Input
                id="minggu"
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
              <Label htmlFor="bulan">Bulan</Label>
              <select
                id="bulan"
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
              <Label htmlFor="tahun">Tahun</Label>
              <Input
                id="tahun"
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
            <Button variant="secondary" onClick={() => setEditing(false)}>
              Batal
            </Button>
            <Button onClick={save}>Simpan</Button>
          </div>
        </div>
      )}
      <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Laporan Harian</h3>
          <Button onClick={openLaporan} className="px-3 py-1">
            Tambah
          </Button>
        </div>
        <Table className="min-w-full">
          <thead>
            <tr className={`${tableStyles.headerRow} text-sm`}>
              <th className={tableStyles.smallCell}>No</th>
              <th className={tableStyles.smallCell}>Tanggal</th>
              <th className={tableStyles.smallCell}>Status</th>
              <th className={tableStyles.smallCell}>Bukti</th>
              <th className={tableStyles.smallCell}>Catatan</th>
              <th className={tableStyles.smallCell}>Aksi</th>
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
                  className={`${tableStyles.row} border-t dark:border-gray-700 text-center`}
                >
                  <td className={tableStyles.smallCell}>{idx + 1}</td>
                  <td className={tableStyles.smallCell}>{l.tanggal.slice(0, 10)}</td>
                  <td className={tableStyles.smallCell}>
                    <StatusBadge status={l.status} />
                  </td>
                  <td className={tableStyles.smallCell}>
                    {l.bukti_link ? (
                      <a
                        href={l.bukti_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline dark:text-blue-400"
                      >
                        Link
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className={tableStyles.smallCell}>{l.catatan || "-"}</td>
                  <td className={`${tableStyles.smallCell} space-x-1`}>
                    <Button
                      onClick={() => editLaporan(l)}
                      variant="warning"
                      icon
                      aria-label="Edit"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      onClick={() => deleteLaporan(l.id)}
                      variant="danger"
                      icon
                      aria-label="Hapus"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {showLaporanForm && (
        <Modal
          onClose={() => setShowLaporanForm(false)}
          titleId="laporan-form-title"
        >
            <h3 id="laporan-form-title" className="text-lg font-semibold">
              {laporanForm.id ? "Edit" : "Tambah"} Laporan Harian
            </h3>
            <div className="space-y-2">
              <div>
                <Label htmlFor="laporanTanggal">
                  Tanggal<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="laporanTanggal"
                  type="date"
                  value={laporanForm.tanggal}
                  onChange={(e) =>
                    setLaporanForm({ ...laporanForm, tanggal: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="laporanStatus">
                  Status<span className="text-red-500">*</span>
                </Label>
                <select
                  id="laporanStatus"
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
                  <Label htmlFor="buktiLink">
                    Link Bukti <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="buktiLink"
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
                <Label htmlFor="catatan">Catatan</Label>
                <textarea
                  id="catatan"
                  value={laporanForm.catatan}
                  onChange={(e) =>
                    setLaporanForm({ ...laporanForm, catatan: e.target.value })
                  }
                  className="form-input"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="secondary" onClick={() => setShowLaporanForm(false)}>
                Batal
              </Button>
              <Button onClick={saveLaporan}>Simpan</Button>
            </div>
        </Modal>
      )}
    </div>
  );
}
