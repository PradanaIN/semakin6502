import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  showSuccess,
  showError,
  showWarning,
  confirmDelete,
  confirmCancel,
} from "../../utils/alerts";
import Select from "react-select";
import selectStyles from "../../utils/selectStyles";
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
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
  const canManage = [ROLES.ADMIN, ROLES.KETUA, ROLES.PIMPINAN].includes(
    user?.role
  );
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
    deskripsi: "",
    status: STATUS.BELUM, // Belum, Sedang Dikerjakan, Selesai Dikerjakan
    bukti_link: "",
    catatan: "",
  });

  const closeLaporanForm = useCallback(() => {
    setShowLaporanForm(false);
  }, []);

  const dateRef = useRef(null);

  const formatDMY = (iso) => {
    const [y, m, d] = iso.slice(0, 10).split("-");
    return `${d}-${m}-${y}`;
  };

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
    axios.get("/master-kegiatan?limit=1000").then((r) => {
      const kData = r.data.data || r.data;
      const sorted = [...kData].sort((a, b) =>
        a.nama_kegiatan.localeCompare(b.nama_kegiatan)
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
      deskripsi: "",
      status: STATUS.BELUM,
      bukti_link: "",
      catatan: "",
    });
    setShowLaporanForm(true);
  };

  const saveLaporan = async () => {
    try {
      if (laporanForm.deskripsi.trim() === "") {
        showWarning("Lengkapi data", "Deskripsi wajib diisi");
        return;
      }
      if (
        laporanForm.status === STATUS.SELESAI_DIKERJAKAN &&
        laporanForm.bukti_link.trim() === ""
      ) {
        showWarning("Lengkapi data", "Link bukti wajib diisi");
        return;
      }

      if (laporanForm.id) {
        await axios.put(`/laporan-harian/${laporanForm.id}`, laporanForm);
      } else {
        await axios.post("/laporan-harian", {
          ...laporanForm,
          penugasanId: parseInt(id, 10),
          pegawaiId: item.pegawaiId,
        });
      }

      showSuccess("Berhasil", "Laporan disimpan");
      setShowLaporanForm(false);

      // Delay fetch laporan agar modal sudah tertutup dulu
      setTimeout(async () => {
        const r = await axios.get(`/laporan-harian/penugasan/${id}`);
        setLaporan(r.data);
        fetchDetail();
      }, 200);
    } catch (err) {
      console.error(err);
      showError("Error", "Gagal menyimpan laporan");
    }
  };

  const editLaporan = (item) => {
    setLaporanForm({
      id: item.id,
      tanggal: item.tanggal.slice(0, 10),
      deskripsi: item.deskripsi || "",
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
      fetchDetail();
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
      if (err?.response?.status === 403) {
        showError(
          "Tidak diizinkan",
          "Hanya admin atau ketua tim yang dapat menghapus penugasan."
        );
      } else {
        const msg = err?.response?.data?.message || "Gagal menghapus";
        showError("Error", msg);
      }
    }
  };

  if (!item) return;

  <div className="flex flex-col justify-center items-center h-72 space-y-3">
    <svg
      className="animate-spin h-10 w-10 text-blue-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.93 6.364A8.001 8.001 0 0112 20v4c-6.627 0-12-5.373-12-12h4a8.001 8.001 0 006.364 2.93zM20 12a8 8 0 01-8 8v4c6.627 0 12-5.373 12-12h-4zm-2.93-6.364A8.001 8.001 0 0112 4V0c6.627 0 12 5.373 12 12h-4a8.001 8.001 0 00-6.364-2.93z"
      ></path>
    </svg>
    <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
      Memuat data penugasan...
    </span>
  </div>;

  return (
    <div className="p-3 space-y-4">
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
            <Button onClick={remove} variant="danger" icon aria-label="Hapus">
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      </div>
      {!editing ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Kegiatan
            </div>
            <div className="font-medium">{item.kegiatan?.nama_kegiatan}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Tim</div>
            <div className="font-medium">{item.kegiatan?.team?.nama_tim}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Pegawai
            </div>
            <div className="font-medium">{item.pegawai?.nama}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Minggu
            </div>
            <div className="font-medium">{item.minggu}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Bulan
            </div>
            <div className="font-medium">{months[item.bulan - 1]}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Tahun
            </div>
            <div className="font-medium">{item.tahun}</div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Deskripsi Penugasan
            </div>
            <div className="font-medium">{item.deskripsi || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Status
            </div>
            <div className="font-medium">
              <StatusBadge status={item.status} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Edit Penugasan
            </h2>
            <p className="text-xs text-red-600 dark:text-red-500">
              * Fardu 'Ain
            </p>
          </div>
          <div>
            <Label htmlFor="kegiatan">
              Kegiatan <span className="text-red-500">*</span>
            </Label>
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
            <Label htmlFor="pegawai">
              Pegawai <span className="text-red-500">*</span>
            </Label>
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
            <Label htmlFor="deskripsi">Deskripsi Penugasan</Label>
            <textarea
              id="deskripsi"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="minggu">
                Minggu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="minggu"
                type="number"
                value={form.minggu}
                min="1"
                max="5"
                onChange={(e) =>
                  setForm({ ...form, minggu: parseInt(e.target.value, 10) })
                }
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="bulan">
                Bulan <span className="text-red-500">*</span>
              </Label>
              <select
                id="bulan"
                value={form.bulan}
                onChange={(e) =>
                  setForm({ ...form, bulan: parseInt(e.target.value, 10) })
                }
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
              >
                {months.map((m, i) => (
                  <option key={i + 1} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="tahun">
                Tahun <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tahun"
                type="number"
                value={form.tahun}
                onChange={(e) =>
                  setForm({ ...form, tahun: parseInt(e.target.value, 10) })
                }
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="secondary"
              onClick={async () => {
                const r = await confirmCancel("Batalkan perubahan?");
                if (r.isConfirmed) {
                  setForm({
                    kegiatanId: item.kegiatanId,
                    pegawaiId: item.pegawaiId,
                    deskripsi: item.deskripsi || "",
                    minggu: item.minggu,
                    bulan: item.bulan,
                    tahun: item.tahun,
                    status: item.status,
                  });
                  setEditing(false);
                }
              }}
            >
              Batal
            </Button>
            <Button onClick={save}>Simpan</Button>
          </div>
        </div>
      )}

      <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Laporan Harian
          </h3>
          {item.status !== STATUS.SELESAI_DIKERJAKAN && (
            <Button
              onClick={openLaporan}
              className="flex items-center gap-2 px-3 py-2 sm:px-4"
              aria-label="Tambah Laporan"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Tambah Laporan</span>
            </Button>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
          <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className={tableStyles.headerRow}>
                <th className={tableStyles.cell}>No</th>
                <th className={tableStyles.cell}>Deskripsi</th>
                <th className={tableStyles.cell}>Tanggal</th>
                <th className={tableStyles.cell}>Status</th>
                <th className={tableStyles.cell}>Bukti</th>
                <th className={tableStyles.cell}>Catatan</th>
                <th className={tableStyles.cell}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {laporan.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    Belum ada laporan
                  </td>
                </tr>
              ) : (
                laporan.map((l, idx) => (
                  <tr
                    key={l.id}
                    className={`${tableStyles.row} border-t dark:border-gray-700 text-center`}
                  >
                    <td className={tableStyles.cell}>{idx + 1}</td>
                    <td className={tableStyles.cell}>{l.deskripsi}</td>
                    <td className={tableStyles.cell}>{formatDMY(l.tanggal)}</td>
                    <td className={tableStyles.cell}>
                      <StatusBadge status={l.status} />
                    </td>
                    <td className={tableStyles.cell}>
                      {l.bukti_link ? (
                        <a
                          href={l.bukti_link}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Lihat bukti dukung"
                        >
                          <ExternalLink
                            size={16}
                            className="mx-auto text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform"
                          />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className={tableStyles.cell}>{l.catatan || "-"}</td>
                    <td className={`${tableStyles.cell} space-x-2`}>
                      <Button
                        onClick={() => editLaporan(l)}
                        variant="warning"
                        icon
                        aria-label="Edit laporan"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        onClick={() => deleteLaporan(l.id)}
                        variant="danger"
                        icon
                        aria-label="Hapus laporan"
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
      </div>

      {showLaporanForm && (
        <Modal onClose={closeLaporanForm} titleId="laporan-form-title">
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-3">
              <h3
                id="laporan-form-title"
                className="text-xl font-bold text-gray-800 dark:text-gray-100"
              >
                {laporanForm.id ? "Edit" : "Tambah"} Laporan Harian
              </h3>
              <p className="text-xs text-red-600 dark:text-red-500">
                * Fardu 'Ain
              </p>
            </div>

            <div className="space-y-4">
              {/* Deskripsi */}
              <div>
                <Label htmlFor="laporanDeskripsi">
                  Deskripsi <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="laporanDeskripsi"
                  value={laporanForm.deskripsi}
                  onChange={(e) =>
                    setLaporanForm({
                      ...laporanForm,
                      deskripsi: e.target.value,
                    })
                  }
                  placeholder="Tuliskan deskripsi kegiatan..."
                  required
                  className="w-full mt-1 rounded-md border px-4 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tanggal */}
              <div>
                <Label htmlFor="laporanTanggal">
                  Tanggal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="laporanTanggal"
                  type="date"
                  ref={dateRef}
                  value={laporanForm.tanggal}
                  onChange={(e) =>
                    setLaporanForm({ ...laporanForm, tanggal: e.target.value })
                  }
                  onFocus={() => dateRef.current?.showPicker()}
                  required
                  className="w-full mt-1 rounded-md border px-4 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="laporanStatus">
                  Status <span className="text-red-500">*</span>
                </Label>
                <select
                  id="laporanStatus"
                  value={laporanForm.status}
                  onChange={(e) =>
                    setLaporanForm({ ...laporanForm, status: e.target.value })
                  }
                  required
                  className="w-full mt-1 rounded-md border px-4 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Link Bukti (opsional, tergantung status) */}
              {laporanForm.status === STATUS.SELESAI_DIKERJAKAN && (
                <div>
                  <Label htmlFor="buktiLink">
                    Link Bukti <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="buktiLink"
                    type="url"
                    value={laporanForm.bukti_link}
                    onChange={(e) =>
                      setLaporanForm({
                        ...laporanForm,
                        bukti_link: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    required
                    className="w-full mt-1 rounded-md border px-4 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Catatan */}
              <div>
                <Label htmlFor="catatan">Catatan</Label>
                <textarea
                  id="catatan"
                  value={laporanForm.catatan}
                  onChange={(e) =>
                    setLaporanForm({ ...laporanForm, catatan: e.target.value })
                  }
                  placeholder="Catatan Kendala..."
                  className="w-full mt-1 rounded-md border px-4 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Aksi tombol */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={async () => {
                  const r = await confirmCancel(
                    laporanForm.id
                      ? "Batalkan perubahan?"
                      : "Batalkan penambahan laporan?"
                  );
                  if (r.isConfirmed) setShowLaporanForm(false);
                }}
              >
                Batal
              </Button>
              <Button onClick={saveLaporan}>Simpan</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
