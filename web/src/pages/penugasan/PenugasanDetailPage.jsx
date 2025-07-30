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
import months from "../../utils/months";
import formatDate from "../../utils/formatDate";
import Loading from "../../components/Loading";

export default function PenugasanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = [ROLES.ADMIN, ROLES.KETUA].includes(user?.role);
  const canManageLaporan = user?.role !== ROLES.PIMPINAN;
  const [item, setItem] = useState(null);
  const canAddReport =
    user?.role === ROLES.ADMIN ||
    user?.role === ROLES.KETUA ||
    user?.id === item?.pegawaiId;
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
      handleAxiosError(err, "Gagal mengambil data");
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
        a.namaKegiatan.localeCompare(b.namaKegiatan)
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
      handleAxiosError(err, "Gagal memperbarui");
    }
  };

  const openLaporan = () => {
    setLaporanForm({
      id: null,
      tanggal: new Date().toISOString().slice(0, 10),
      deskripsi: "",
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
        showWarning("Lengkapi data", "Deskripsi wajib diisi");
        return;
      }
      if (
        laporanForm.status === STATUS.SELESAI_DIKERJAKAN &&
        !(typeof laporanForm.buktiLink === "string" ? laporanForm.buktiLink : "").trim()
      ) {
        showWarning("Lengkapi data", "Link bukti wajib diisi");
        return;
      }

      const payload = { ...laporanForm };
      if (payload.buktiLink === "") delete payload.buktiLink;
      if (payload.catatan === "") delete payload.catatan;

      if (laporanForm.id) {
        await axios.put(`/laporan-harian/${laporanForm.id}`, payload);
      } else {
        await axios.post("/laporan-harian", {
          ...payload,
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
      console.error("Failed to save report", err?.response?.data || err);
      handleAxiosError(err, "Gagal menyimpan laporan");
    } finally {
      setSaving(false);
    }
  };

  const editLaporan = (item) => {
    setLaporanForm({
      ...item,
      id: item.id,
      tanggal: item.tanggal.slice(0, 10),
      deskripsi: item.deskripsi ?? "",
      status: item.status,
      catatan: item.catatan ?? "",
      buktiLink: item.buktiLink ?? "",
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

  const columns = useMemo(
    () => {
      const cols = [
      {
        Header: "No",
        accessor: (_row, i) => i + 1,
        disableFilters: true,
      },
      { Header: "Deskripsi", accessor: "deskripsi", disableFilters: true },
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
      }];
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
    },
    [editLaporan, deleteLaporan, canManageLaporan]
  );

  const remove = async () => {
    const r = await confirmDelete("Hapus penugasan ini?");
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/penugasan/${id}`);
      showSuccess("Dihapus", "Penugasan dihapus");
      navigate(-1);
    } catch (err) {
      if (err?.response?.status === 403) {
        showError(
          "Tidak diizinkan",
          "Hanya admin atau ketua tim yang dapat menghapus penugasan."
        );
      } else {
        const msg = err?.response?.data?.message || "Gagal menghapus";
        showError("Error", msg);
      }
      handleAxiosError(err, "Gagal menghapus penugasan");
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Kegiatan
            </div>
            <div className="font-medium">{item.kegiatan?.namaKegiatan}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Tim</div>
            <div className="font-medium">{item.kegiatan?.team?.namaTim}</div>
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
                label: k.namaKegiatan,
              }))}
              value={{
                value: form.kegiatanId,
                label:
                  kegiatan.find((k) => k.id === form.kegiatanId)
                    ?.namaKegiatan || "",
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
          <DataTable columns={columns} data={laporan} showGlobalFilter={false} showPagination={false} selectable={false} />
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

              {/* Link Bukti (opsional, tergantung status) */}
              {laporanForm.status === STATUS.SELESAI_DIKERJAKAN && (
                <div>
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
