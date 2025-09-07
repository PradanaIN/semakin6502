import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  showSuccess,
  showError,
  showWarning,
  confirmDelete,
  confirmCancel,
  handleAxiosError,
} from "../../utils/alerts";
import Select from "react-select";
import selectStyles from "../../utils/selectStyles";
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { ROLES } from "../../utils/roles";
import { STATUS, formatStatus } from "../../utils/status";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import Textarea from "../../components/ui/Textarea";
import months from "../../utils/months";
import formatDate from "../../utils/formatDate";
import Loading from "../../components/Loading";

export default function PenugasanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const canManage = [ROLES.ADMIN, ROLES.KETUA].includes(user?.role);
  const canManageLaporan =
    [ROLES.ADMIN, ROLES.KETUA].includes(user?.role) ||
    String(user?.id) === String(item?.pegawaiId);
  const canAddReport =
    user?.role === ROLES.ADMIN ||
    user?.role === ROLES.KETUA ||
    String(user?.id) === String(item?.pegawaiId);
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
    tanggal: new Date().toISOString().slice(0, 10),
    deskripsi: "",
    capaianKegiatan: "",
    status: STATUS.BELUM, // Belum, Sedang Dikerjakan, Selesai Dikerjakan
    catatan: "",
    buktiLink: "",
  });
  const [saving, setSaving] = useState(false);

  const closeLaporanForm = useCallback(() => {
    setShowLaporanForm(false);
  }, []);

  const dateRef = useRef(null);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await axios.get(`/penugasan/${id}`);
      const normalized = {
        ...res.data,
        kegiatanId: String(res.data.kegiatanId),
        pegawaiId: String(res.data.pegawaiId),
        bulan: parseInt(res.data.bulan, 10) || 1,
      };
      setItem(normalized);
      setForm({
        kegiatanId: normalized.kegiatanId,
        pegawaiId: normalized.pegawaiId,
        deskripsi: res.data.deskripsi || "",
        minggu: res.data.minggu,
        bulan: normalized.bulan,
        tahun: res.data.tahun,
        status: res.data.status,
      });
    } catch (err) {
      handleAxiosError(err, "Gagal mengambil data");
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
    axios
      .get(`/laporan-harian/penugasan/${id}`)
      .then((r) => setLaporan(r.data));
    if (canManage) {
      axios.get("/users", { params: { pageSize: 1000 } }).then((r) => {
        const sorted = [...r.data].sort((a, b) => a.nama.localeCompare(b.nama));
        setUsers(sorted);
      });
    } else if (user) {
      setUsers([user]);
    }
  }, [id, canManage, user, fetchDetail]);

  useEffect(() => {
    if (!canManage) return;
    const fetchKegiatan = async () => {
      try {
        let url = "/master-kegiatan?limit=1000";
        if (user?.role !== ROLES.ADMIN) {
          const teamId = item?.kegiatan?.teamId || user?.teamId;
          if (!teamId) {
            setKegiatan([]);
            return;
          }
          url = `/master-kegiatan?team=${teamId}`;
        }
        const r = await axios.get(url);
        const kData = r.data.data || r.data;
        const sorted = [...kData].sort((a, b) =>
          a.namaKegiatan.localeCompare(b.namaKegiatan)
        );
        setKegiatan(sorted);
      } catch {
        // ignore error
      }
    };
    fetchKegiatan();
  }, [canManage, user, item]);

  const save = async () => {
    try {
      await axios.put(`/penugasan/${id}`, form);
      showSuccess("Berhasil", "Penugasan diperbarui");
      setEditing(false);
      fetchDetail();
    } catch (err) {
      handleAxiosError(err, "Gagal memperbarui");
    }
  };

  const openLaporan = () => {
    setLaporanForm({
      tanggal: new Date().toISOString().slice(0, 10),
      deskripsi: "",
      capaianKegiatan: "",
      status: STATUS.BELUM,
      catatan: "",
      buktiLink: "",
    });
    setSaving(false);
    setShowLaporanForm(true);
  };

  const saveLaporan = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (laporanForm.deskripsi.trim() === "") {
        showWarning("Lengkapi data", "Deskripsi Kegiatan wajib diisi");
        return;
      }
      if (laporanForm.capaianKegiatan.trim() === "") {
        showWarning("Lengkapi data", "Capaian Kegiatan wajib diisi");
        return;
      }
      if (
        (laporanForm.status === STATUS.SEDANG_DIKERJAKAN ||
          laporanForm.status === STATUS.SELESAI_DIKERJAKAN) &&
        !(
          typeof laporanForm.buktiLink === "string" ? laporanForm.buktiLink : ""
        ).trim()
      ) {
        showWarning("Lengkapi data", "Link bukti wajib diisi");
        return;
      }

      const { id: laporanId, ...data } = laporanForm;
      const payload = {
        ...data,
        buktiLink: data.buktiLink || "",
        catatan: data.catatan || "",
      };

      if (laporanId) {
        await axios.put(`/laporan-harian/${laporanId}`, payload);
      } else {
        await axios.post("/laporan-harian", {
          ...payload,
          penugasanId: id,
          pegawaiId: item.pegawaiId,
        });
      }

      showSuccess("Berhasil", "Laporan disimpan");
      setShowLaporanForm(false);

      setTimeout(async () => {
        const r = await axios.get(`/laporan-harian/penugasan/${id}`);
        setLaporan(r.data);
        fetchDetail();
      }, 200);
    } catch (err) {
      console.error("Failed to save report", err?.response?.data || err);
      if (err?.response?.status >= 500) {
        console.error(err.response);
      }
      handleAxiosError(err, "Gagal menyimpan laporan");
    } finally {
      setSaving(false);
    }
  };

  const editLaporan = (lap) => {
    setLaporanForm({
      id: lap.id,
      tanggal: lap.tanggal.slice(0, 10),
      deskripsi: lap.deskripsi || "",
      capaianKegiatan: lap.capaianKegiatan || "",
      status: lap.status,
      catatan: lap.catatan ?? "",
      buktiLink: lap.buktiLink ?? "",
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
      handleAxiosError(err, "Gagal menghapus laporan");
    }
  };

  const columns = useMemo(() => {
    const cols = [
      {
        Header: "No",
        accessor: (_row, i) => i + 1,
        disableFilters: true,
      },
      {
        Header: "Deskripsi Kegiatan",
        accessor: "deskripsi",
        disableFilters: true,
      },
      {
        Header: "Capaian Kegiatan",
        accessor: "capaianKegiatan",
        disableFilters: true,
      },
      {
        Header: "Tanggal",
        accessor: (row) => formatDate(row.tanggal),
        disableFilters: true,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ row }) => <StatusBadge status={row.original.status} />,
        disableFilters: true,
      },
      {
        Header: "Bukti",
        accessor: "buktiLink",
        Cell: ({ row }) =>
          row.original.buktiLink ? (
            <a
              href={row.original.buktiLink}
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
          ),
        disableFilters: true,
      },
      {
        Header: "Catatan",
        accessor: (row) => row.catatan || "-",
        disableFilters: true,
      },
    ];
    if (canManageLaporan) {
      cols.push({
        Header: "Aksi",
        accessor: "id",
        Cell: ({ row }) => (
          <div className="space-x-2">
            <Button
              onClick={() => editLaporan(row.original)}
              variant="warning"
              icon
              aria-label="Edit laporan"
            >
              <Pencil size={14} />
            </Button>
            <Button
              onClick={() => deleteLaporan(row.original.id)}
              variant="danger"
              icon
              aria-label="Hapus laporan"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ),
        disableFilters: true,
      });
    }
    return cols;
  }, [editLaporan, deleteLaporan, canManageLaporan]);

  const remove = async () => {
    const r = await confirmDelete("Hapus penugasan ini?");
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/penugasan/${id}`, { suppressToast: true });
      navigate("/tugas-mingguan", {
        state: { success: "Penugasan dihapus" },
      });
    } catch (err) {
      if (err?.response?.status === 403) {
        showError(
          "Tidak diizinkan",
          "Hanya admin atau ketua tim yang dapat menghapus penugasan."
        );
      } else {
        handleAxiosError(err, "Gagal menghapus penugasan");
      }
    }
  };

  if (!item) {
    return <Loading fullScreen />;
  }

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow">
          {/* Kegiatan */}
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
              {/* icon: clipboard-list */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                <path d="M16 4h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1"></path>
                <line x1="9" y1="12" x2="15" y2="12"></line>
                <line x1="9" y1="16" x2="15" y2="16"></line>
              </svg>
              Kegiatan
            </div>
            <div className="font-medium">{item.kegiatan?.namaKegiatan}</div>
          </div>
          {/* Deskripsi Penugasan */}
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
              {/* icon: file-text */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              Deskripsi Penugasan
            </div>
            <div className="font-medium">{item.deskripsi || "-"}</div>
          </div>

          {/* Tim */}
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
              {/* icon: users */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Tim
            </div>
            <div className="font-medium">{item.kegiatan?.team?.namaTim}</div>
          </div>
          {/* Pegawai */}
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
              {/* icon: user */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Pegawai
            </div>
            <div className="font-medium">{item.pegawai?.nama}</div>
          </div>

          {/* Waktu (compact) */}
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
              {/* icon: calendar */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Waktu
            </div>
            <div className="font-medium">{`Minggu ${item.minggu} • ${
              months[item.bulan - 1]
            } ${item.tahun}`}</div>
          </div>

          {/* Status */}
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
              {/* icon: circle */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="currentColor"
                className="text-gray-400"
              >
                <circle cx="12" cy="12" r="5" />
              </svg>
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
                value: String(k.id),
                label: k.namaKegiatan,
              }))}
              value={
                form.kegiatanId
                  ? {
                      value: form.kegiatanId,
                      label:
                        kegiatan.find(
                          (k) => String(k.id) === String(form.kegiatanId)
                        )?.namaKegiatan || "",
                    }
                  : null
              }
              onChange={(o) =>
                setForm({
                  ...form,
                  kegiatanId: o ? o.value : "",
                })
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
                .map((u) => ({ value: String(u.id), label: u.nama }))}
              value={
                form.pegawaiId
                  ? {
                      value: form.pegawaiId,
                      label:
                        users.find(
                          (u) => String(u.id) === String(form.pegawaiId)
                        )?.nama || "",
                    }
                  : null
              }
              onChange={(o) =>
                setForm({
                  ...form,
                  pegawaiId: o ? o.value : "",
                })
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
          {item.status !== STATUS.SELESAI_DIKERJAKAN && canAddReport && (
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

        <div className="overflow-x-auto md:overflow-x-visible rounded-lg border dark:border-gray-700">
          <DataTable
            columns={columns}
            data={laporan}
            showGlobalFilter={false}
            showPagination={false}
            selectable={false}
          />
        </div>
      </div>

      {showLaporanForm && (
        <Modal onClose={closeLaporanForm} titleId="laporan-form-title">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3
                id="laporan-form-title"
                className="text-lg font-semibold text-gray-800 dark:text-gray-100"
              >
                {laporanForm.id ? "Edit" : "Tambah"} Laporan Harian
              </h3>
              <span className="text-xs text-red-500">* Fardu 'Ain</span>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deskripsi */}
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="laporanDeskripsi">
                  Deskripsi Kegiatan <span className="text-red-500">*</span>
                </Label>
                <Textarea
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
                />
              </div>

              {/* Capaian */}
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="capaianKegiatan">
                  Capaian Kegiatan <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="capaianKegiatan"
                  value={laporanForm.capaianKegiatan}
                  onChange={(e) =>
                    setLaporanForm({
                      ...laporanForm,
                      capaianKegiatan: e.target.value,
                    })
                  }
                  placeholder="Tuliskan capaian kegiatan..."
                  required
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
                  className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value={STATUS.BELUM}>
                    {formatStatus(STATUS.BELUM)}
                  </option>
                  <option value={STATUS.SEDANG_DIKERJAKAN}>
                    {formatStatus(STATUS.SEDANG_DIKERJAKAN)}
                  </option>
                  <option value={STATUS.SELESAI_DIKERJAKAN}>
                    {formatStatus(STATUS.SELESAI_DIKERJAKAN)}
                  </option>
                </select>
              </div>

              {/* Link Bukti - tampil jika sedang atau selesai */}
              {(laporanForm.status === STATUS.SEDANG_DIKERJAKAN ||
                laporanForm.status === STATUS.SELESAI_DIKERJAKAN) && (
                <div className="col-span-1 md:col-span-2">
                  <Label htmlFor="buktiLink">
                    Link Bukti <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="buktiLink"
                    type="url"
                    value={laporanForm.buktiLink}
                    onChange={(e) =>
                      setLaporanForm({
                        ...laporanForm,
                        buktiLink: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    required
                  />
                </div>
              )}

              {/* Catatan */}
              <details className="col-span-1 md:col-span-2 mt-2">
                <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-400">
                  Tambah Catatan Kendala (Opsional)
                </summary>
                <div className="mt-2">
                  <Label htmlFor="catatan">Catatan</Label>
                  <Textarea
                    id="catatan"
                    value={laporanForm.catatan}
                    onChange={(e) =>
                      setLaporanForm({
                        ...laporanForm,
                        catatan: e.target.value,
                      })
                    }
                    placeholder="Catatan kendala..."
                  />
                </div>
              </details>
            </form>

            {/* Aksi tombol */}
            <div className="flex justify-end gap-2 mt-6">
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
              <Button type="button" onClick={saveLaporan} disabled={saving}>
                Simpan
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
