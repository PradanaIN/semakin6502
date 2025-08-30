import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  showSuccess,
  confirmDelete,
  confirmCancel,
  handleAxiosError,
  showWarning,
  showError,
} from "../../utils/alerts";
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import Select from "react-select";
import selectStyles from "../../utils/selectStyles";
import { STATUS, formatStatus } from "../../utils/status";
import StatusBadge from "../../components/ui/StatusBadge";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Label from "../../components/ui/Label";
import Textarea from "../../components/ui/Textarea";
import formatDate from "../../utils/formatDate";
import Spinner from "../../components/Spinner";
import { useAuth } from "../auth/useAuth";
import { ROLES } from "../../utils/roles";
import { getWeekOfMonth } from "../../utils/dateUtils";
import months from "../../utils/months";

function getDateFromPeriod(minggu, bulan, tahun) {
  // First day within the requested week in the month
  const monthIndex = bulan - 1;
  const first = new Date(tahun, monthIndex, 1);
  const offset = (first.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(tahun, monthIndex + 1, 0).getDate();
  const startDay = (minggu - 1) * 7 - offset + 1;
  const day = Math.min(daysInMonth, Math.max(1, startDay));
  const yyyy = tahun;
  const mm = String(bulan).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function TugasTambahanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const canManage =
    [ROLES.ADMIN, ROLES.KETUA].includes(user?.role) ||
    user?.id === item?.userId;
  const canManageLaporan =
    [ROLES.ADMIN, ROLES.KETUA].includes(user?.role) ||
    String(user?.id) === String(item?.userId);
  const [editing, setEditing] = useState(false);
  const [kegiatan, setKegiatan] = useState([]);
  const [teams, setTeams] = useState([]);
  const [laporan, setLaporan] = useState([]);
  const canAddLaporan =
    canManageLaporan &&
    !laporan.some((l) => l.status === STATUS.SELESAI_DIKERJAKAN);
  const [showLaporanForm, setShowLaporanForm] = useState(false);
  const [laporanForm, setLaporanForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    deskripsi: "",
    capaianKegiatan: "",
    status: STATUS.BELUM,
    catatan: "",
    buktiLink: "",
  });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    teamId: "",
    kegiatanId: "",
    deskripsi: "",
    minggu: 1,
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
  });
  const laporanTanggalRef = useRef(null);

  const { minggu, bulan, tahun } = useMemo(() => {
    if (!item?.tanggal) return { minggu: "", bulan: "", tahun: "" };
    const d = new Date(item.tanggal);
    return {
      minggu: getWeekOfMonth(d),
      bulan: months[d.getMonth()],
      tahun: d.getFullYear(),
    };
  }, [item?.tanggal]);

  const fetchKegiatanForTeam = useCallback(
    async (teamId) => {
      if (!teamId) {
        setKegiatan([]);
        return;
      }
      try {
        // Allow non-admin browsing across teams for tugas tambahan context
        let res;
        if (user?.role === ROLES.ADMIN) {
          res = await axios.get(`/master-kegiatan?team=${teamId}`);
        } else {
          res = await axios.get(`/master-kegiatan?team=${teamId}`, {
            headers: { "X-For-Tambahan": "1" },
          });
        }
        setKegiatan(res.data.data || res.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setKegiatan([]);
          return;
        }
        handleAxiosError(err, "Gagal mengambil kegiatan");
        setKegiatan([]);
      }
    },
    [user?.role]
  );

  const fetchDetail = useCallback(async () => {
    try {
      const dRes = await axios.get(`/tugas-tambahan/${id}`);
      setItem(dRes.data);

      const teamId = dRes.data.kegiatan?.teamId || "";
      await fetchKegiatanForTeam(teamId);

      const d = dRes.data.tanggal ? new Date(dRes.data.tanggal) : new Date();
      setForm({
        teamId: teamId ? String(teamId) : "",
        kegiatanId: String(dRes.data.kegiatanId),
        deskripsi: dRes.data.deskripsi || "",
        minggu: dRes.data.tanggal ? getWeekOfMonth(d) : 1,
        bulan: d.getMonth() + 1,
        tahun: d.getFullYear(),
      });
    } catch (err) {
      handleAxiosError(err, "Gagal mengambil data");
    }
  }, [id, fetchKegiatanForTeam]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get("/teams/all");
        setTeams(
          res.data.filter(
            (t) => t.namaTim !== "Admin" && t.namaTim !== "Pimpinan"
          )
        );
      } catch (err) {
        handleAxiosError(err, "Gagal mengambil tim");
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchDetail();
    axios.get(`/laporan-harian/tambahan/${id}`).then((r) => setLaporan(r.data));
  }, [fetchDetail, id]);

  const handleTeamChange = async (o) => {
    const teamId = o ? o.value : "";
    setForm({ ...form, teamId, kegiatanId: "" });
    if ([ROLES.ADMIN, ROLES.KETUA].includes(user?.role)) {
      await fetchKegiatanForTeam(teamId);
    }
  };

  const save = async () => {
    try {
      if (
        form.teamId === "" ||
        form.kegiatanId === "" ||
        form.deskripsi.trim() === "" ||
        !form.minggu ||
        !form.bulan ||
        !form.tahun
      ) {
        showWarning("Lengkapi data", "Semua field wajib diisi");
        return;
      }
      const payload = {
        kegiatanId: form.kegiatanId,
        deskripsi: form.deskripsi,
        tanggal: getDateFromPeriod(form.minggu, form.bulan, form.tahun),
      };
      await axios.put(`/tugas-tambahan/${id}`, payload);
      showSuccess("Berhasil", "Kegiatan diperbarui");
      setEditing(false);
      fetchDetail();
    } catch (err) {
      handleAxiosError(err, "Gagal menyimpan");
    }
  };

  const closeLaporanForm = useCallback(() => {
    setShowLaporanForm(false);
  }, []);

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

      const { id: laporanId, ...rest } = laporanForm;
      const payload = {
        ...rest,
        buktiLink: rest.buktiLink || "",
        catatan: rest.catatan || "",
      };

      if (laporanId) {
        await axios.put(`/laporan-harian/${laporanId}`, payload);
      } else {
        await axios.post(`/tugas-tambahan/${id}/laporan`, payload);
      }

      showSuccess("Berhasil", "Laporan disimpan");
      setShowLaporanForm(false);

      setTimeout(async () => {
        const r = await axios.get(`/laporan-harian/tambahan/${id}`);
        setLaporan(r.data);
        fetchDetail();
      }, 200);
    } catch (err) {
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
      await axios.delete(`/laporan-harian/${laporanId}`, {
        suppressToast: true,
      });
      const res = await axios.get(`/laporan-harian/tambahan/${id}`);
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
    const r = await confirmDelete("Hapus kegiatan ini?");
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/tugas-tambahan/${id}`, { suppressToast: true });
      navigate("/tugas-tambahan", {
        state: { success: "Kegiatan dihapus" },
      });
    } catch (err) {
      if ([400, 403].includes(err?.response?.status)) {
        showError("Gagal", "Harap hapus laporan harian terlebih dahulu!");
      } else {
        handleAxiosError(err, "Gagal menghapus");
      }
    }
  };

  if (!item)
    return (
      <div className="p-6 text-center">
        <Spinner className="h-6 w-6 mx-auto" />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Detail Tugas Tambahan</h2>
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
        <div className="space-y-4">
          <div
            data-testid="detail-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow"
          >
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
              <div className="font-medium">{item.nama}</div>
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
              <div className="font-medium">
                {item.kegiatan.team?.namaTim || "-"}
              </div>
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
              <div className="font-medium">{item.user?.nama || user.nama}</div>
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
              <div className="font-medium">{`Minggu ${minggu} • ${bulan} ${tahun}`}</div>
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
          {item.tanggalSelesai && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tanggal Selesai
              </div>
              <div className="font-medium">
                {formatDate(item.tanggalSelesai)}
                {item.tanggalSelesaiAkhir &&
                  ` - ${formatDate(item.tanggalSelesaiAkhir)}`}
              </div>
            </div>
          )}
          {item.buktiLink && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Bukti
              </div>
              <a
                href={item.buktiLink}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-600 underline dark:text-blue-400"
              >
                Link
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div>
            <label htmlFor="team" className="block text-sm mb-1">
              Tim <span className="text-red-500">*</span>
            </label>
            <Select
              inputId="team"
              classNamePrefix="react-select"
              styles={selectStyles}
              menuPortalTarget={document.body}
              options={teams.map((t) => ({
                value: t.id.toString(),
                label: t.namaTim,
              }))}
              value={
                form.teamId
                  ? {
                      value: form.teamId,
                      label: teams.find((t) => t.id.toString() === form.teamId)
                        ?.namaTim,
                    }
                  : null
              }
              onChange={handleTeamChange}
              placeholder="Pilih tim..."
            />
          </div>
          <div>
            <label htmlFor="kegiatan" className="block text-sm mb-1">
              Kegiatan <span className="text-red-500">*</span>
            </label>
            <Select
              inputId="kegiatan"
              classNamePrefix="react-select"
              styles={selectStyles}
              menuPortalTarget={document.body}
              options={kegiatan.map((k) => ({
                value: k.id.toString(),
                label: k.namaKegiatan,
              }))}
              value={
                form.kegiatanId
                  ? {
                      value: form.kegiatanId,
                      label: kegiatan.find(
                        (k) => k.id.toString() === form.kegiatanId
                      )?.namaKegiatan,
                    }
                  : null
              }
              onChange={(o) =>
                setForm({ ...form, kegiatanId: o ? o.value : "" })
              }
              placeholder={
                form.teamId ? "Pilih kegiatan..." : "Pilih tim terlebih dahulu"
              }
              isDisabled={!form.teamId}
            />
          </div>
          <div>
            <label htmlFor="deskripsi" className="block text-sm mb-1">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              id="deskripsi"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <Label htmlFor="minggu">
                Minggu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="minggu"
                type="number"
                min="1"
                max="6"
                value={form.minggu}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minggu: parseInt(e.target.value || "0", 10),
                  })
                }
                required
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
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
                required
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
                  setForm({
                    ...form,
                    tahun: parseInt(e.target.value || "0", 10),
                  })
                }
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="secondary"
              onClick={async () => {
                const r = await confirmCancel("Batalkan perubahan?");
                if (r.isConfirmed) setEditing(false);
              }}
            >
              Batal
            </Button>
            <Button onClick={save}>Simpan</Button>
          </div>
        </div>
      )}
      <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Laporan Harian</h3>
          {canAddLaporan && (
            <Button onClick={openLaporan} className="add-button">
              <Plus size={16} />
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
              <h3 id="laporan-form-title" className="text-lg font-semibold">
                {laporanForm.id ? "Edit" : "Tambah"} Laporan Harian
              </h3>
              <span className="text-xs text-red-500">* Fardu 'Ain</span>
            </div>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="laporanTanggal">
                  Tanggal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="laporanTanggal"
                  type="date"
                  ref={laporanTanggalRef}
                  value={laporanForm.tanggal}
                  onChange={(e) =>
                    setLaporanForm({ ...laporanForm, tanggal: e.target.value })
                  }
                  onFocus={() => laporanTanggalRef.current?.showPicker?.()}
                  required
                />
              </div>
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
