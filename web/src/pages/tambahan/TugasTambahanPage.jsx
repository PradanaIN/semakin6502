import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  showSuccess,
  handleAxiosError,
  showWarning,
  confirmCancel,
} from "../../utils/alerts";
import { Plus, Eye } from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/ui/Button";
import Label from "../../components/ui/Label";
import MonthYearPicker from "../../components/ui/MonthYearPicker";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import Textarea from "../../components/ui/Textarea";
import Input from "../../components/ui/Input";
import { STATUS } from "../../utils/status";
import SearchInput from "../../components/SearchInput";
import TableSkeleton from "../../components/ui/TableSkeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../auth/useAuth";
import { ROLES } from "../../utils/roles";
// import formatDate from "../../utils/formatDate";
import months from "../../utils/months";
import { getWeekOfMonth } from "../../utils/dateUtils";

function sortTambahan(list, teamId) {
  return [...list].sort((a, b) => {
    if (a.status === STATUS.BELUM && b.status !== STATUS.BELUM) return -1;
    if (b.status === STATUS.BELUM && a.status !== STATUS.BELUM) return 1;
    const dateDiff = new Date(b.tanggal) - new Date(a.tanggal);
    if (dateDiff !== 0) return dateDiff;
    const aOwn = teamId && String(a.teamId) === String(teamId);
    const bOwn = teamId && String(b.teamId) === String(teamId);
    if (aOwn && !bOwn) return -1;
    if (bOwn && !aOwn) return 1;
    return 0;
  });
}

const getCurrentWeek = () => getWeekOfMonth(new Date());

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
  // Return local date string to avoid timezone shift
  return `${yyyy}-${mm}-${dd}`;
}

export default function TugasTambahanPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [teams, setTeams] = useState([]);
  const [kegiatan, setKegiatan] = useState([]);
  const [form, setForm] = useState({
    teamId: "",
    kegiatanId: "",
    minggu: getCurrentWeek(),
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    deskripsi: "",
    status: STATUS.BELUM,
    capaianKegiatan: "",
  });
  const [search, setSearch] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear());
  // Pagination handled by DataTable internal controls
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const canManage = user?.role !== ROLES.PIMPINAN;
  const [filterTeam, setFilterTeam] = useState("");
  const [filterMinggu, setFilterMinggu] = useState("");
  const [weekOptions, setWeekOptions] = useState([]);

  useEffect(() => {
    if (location.state?.success) {
      showSuccess("Dihapus", location.state.success);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);
  const fetchKegiatanForTeam = async (teamId) => {
    if (!teamId) {
      setKegiatan([]);
      return;
    }
    try {
      // Allow anggota/ketua to browse kegiatan across teams specifically for tugas tambahan
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
      handleAxiosError(err, "Gagal mengambil kegiatan");
      setKegiatan([]);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterTeam) params.teamId = filterTeam;
      const tugasReq =
        user?.role === ROLES.ADMIN || user?.role === ROLES.PIMPINAN
          ? axios.get("/tugas-tambahan/all", { params })
          : axios.get("/tugas-tambahan");

      const [tRes, kRes, teamRes] = await Promise.all([
        tugasReq,
        user?.role === ROLES.ADMIN || user?.role === ROLES.KETUA
          ? axios.get("/master-kegiatan?limit=1000")
          : Promise.resolve({ data: [] }),
        axios.get("/teams/all"),
      ]);
      setItems(sortTambahan(tRes.data, user?.teamId));
      setKegiatan(kRes.data.data || kRes.data);
      setTeams(
        teamRes.data.filter(
          (t) => t.namaTim !== "Admin" && t.namaTim !== "Pimpinan"
        )
      );
    } catch (err) {
      handleAxiosError(err, "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterTeam, user?.role]);

  useEffect(() => {
    if (!filterBulan || !filterTahun) {
      setWeekOptions([]);
      setFilterMinggu("");
      return;
    }
    const year = parseInt(filterTahun, 10);
    const monthIdx = parseInt(filterBulan, 10) - 1;
    const first = new Date(year, monthIdx, 1);
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const offset = (first.getDay() + 6) % 7; // Monday=0
    const weeks = Math.ceil((daysInMonth + offset) / 7);
    const opts = Array.from({ length: weeks }, (_, i) => i + 1);
    setWeekOptions(opts);
    if (filterMinggu && filterMinggu > opts.length) setFilterMinggu("");
  }, [filterBulan, filterTahun, filterMinggu]);

  const openCreate = () => {
    setForm({
      teamId: "",
      kegiatanId: "",
      minggu: getCurrentWeek(),
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
      status: STATUS.BELUM,
      deskripsi: "",
      capaianKegiatan: "",
    });
    setKegiatan([]);
    setShowForm(true);
  };

  const handleCancel = async () => {
    const r = await confirmCancel("Batalkan penambahan?");
    if (r.isConfirmed) setShowForm(false);
  };

  const save = async () => {
    if (
      !form.teamId ||
      !form.kegiatanId ||
      !form.minggu ||
      !form.bulan ||
      !form.tahun ||
      form.deskripsi.trim() === ""
    ) {
      showWarning("Lengkapi data", "Semua kolom wajib diisi");
      return;
    }
    try {
      setSaving(true);
      const payload = { ...form };
      payload.tanggal = getDateFromPeriod(form.minggu, form.bulan, form.tahun);
      delete payload.teamId;
      delete payload.minggu;
      delete payload.bulan;
      delete payload.tahun;
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "" && k !== "capaianKegiatan") delete payload[k];
      });
      await axios.post("/tugas-tambahan", payload);
      setShowForm(false);
      fetchData();
      showSuccess("Berhasil", "Data disimpan");
    } catch (err) {
      handleAxiosError(err, "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (id) => {
    navigate(`/tugas-tambahan/${id}`);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const text = `${item.nama} ${
        item.kegiatan?.team?.namaTim || ""
      }`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const date = new Date(item.tanggal);
      const bulan = date.getMonth() + 1;
      const tahun = date.getFullYear();
      const matchBulan = filterBulan
        ? bulan === parseInt(filterBulan, 10)
        : true;
      const matchTahun = filterTahun
        ? tahun === parseInt(filterTahun, 10)
        : true;
      const matchTeam = filterTeam ? String(item.teamId) === filterTeam : true;
      let matchMinggu = true;
      if (filterMinggu && filterBulan && filterTahun) {
        const weekNum = getWeekOfMonth(date);
        matchMinggu = weekNum === parseInt(filterMinggu, 10);
      }
      return (
        matchesSearch && matchBulan && matchTahun && matchTeam && matchMinggu
      );
    });
  }, [items, search, filterBulan, filterTahun, filterTeam, filterMinggu]);

  // No manual pagination; pass full filteredItems to DataTable

  const columns = useMemo(
    () => [
      {
        Header: "No",
        accessor: (_row, i) => i + 1,
        disableFilters: true,
      },
      { Header: "Kegiatan", accessor: "nama", disableFilters: true },
      { Header: "Deskripsi", accessor: (row) => row.deskripsi || "-", disableFilters: true },
      { Header: "Tim", accessor: (row) => row.kegiatan.team?.namaTim || "-", disableFilters: true },
      { Header: "Minggu", accessor: (row) => getWeekOfMonth(new Date(row.tanggal)), disableFilters: true },
      { Header: "Bulan", accessor: (row) => {
          const d = new Date(row.tanggal);
          return `${months[d.getMonth()]} ${d.getFullYear()}`;
        }, disableFilters: true },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ row }) => <StatusBadge status={row.original.status} />,
        disableFilters: true,
      },
      {
        Header: "Aksi",
        accessor: "id",
        Cell: ({ row }) => (
          <Button
            onClick={() => openDetail(row.original.id)}
            variant="icon"
            icon
            aria-label="Detail"
          >
            <Eye size={16} />
          </Button>
        ),
        disableFilters: true,
      },
    ],
    [user?.role]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kegiatan..."
            ariaLabel="Cari kegiatan"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[ROLES.ADMIN, ROLES.PIMPINAN].includes(user?.role) && (
            <select
              value={filterTeam}
              onChange={(e) => {
                setFilterTeam(e.target.value);
              }}
              className="cursor-pointer border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 dark:hover:border-blue-400 shadow-sm transition duration-150 ease-in-out"
            >
              <option value="">Semua Tim</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.namaTim}
                </option>
              ))}
            </select>
          )}
          <MonthYearPicker
            month={filterBulan}
            year={filterTahun}
            onMonthChange={(val) => {
              setFilterBulan(val);
              setFilterMinggu("");
            }}
            onYearChange={(val) => {
              setFilterTahun(val);
              setFilterMinggu("");
            }}
          />
          <select
            value={filterMinggu}
            onChange={(e) => setFilterMinggu(e.target.value)}
            className="cursor-pointer border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 dark:hover:border-blue-400 shadow-sm transition duration-150 ease-in-out"
          >
            <option value="">Minggu</option>
            {weekOptions.map((w) => (
              <option key={w} value={w}>
                Minggu {w}
              </option>
            ))}
          </select>
          {canManage && (
            <Button onClick={openCreate} className="add-button">
              <Plus size={16} />
              <span className="hidden sm:inline">Tugas Tambahan</span>
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto md:overflow-x-visible min-h-[120px]">
        {loading ? (
          <TableSkeleton cols={columns.length} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            message="Belum ada tugas tambahan untuk periode ini"
            {...(canManage
              ? { actionLabel: "Tambah Tugas Tambahan", onAction: openCreate }
              : {})}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredItems}
            showGlobalFilter={false}
            showPagination={true}
            selectable={false}
          />
        )}
      </div>

      {canManage && showForm && (
        <Modal
          onClose={() => setShowForm(false)}
          titleId="tugas-tambahan-modal-title"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="tugas-tambahan-modal-title"
              className="text-xl font-semibold"
            >
              Tambah Tugas Tambahan
            </h2>
            <p className="text-xs text-red-600 dark:text-red-500">
              * Wajib diisi
            </p>
          </div>

          <div className="space-y-4">
            {/* Tim */}
            <div>
              <Label htmlFor="teamId">
                Tim <span className="text-red-500">*</span>
              </Label>
              <select
                id="teamId"
                value={form.teamId}
                onChange={(e) => {
                  const tId = e.target.value;
                  setForm({ ...form, teamId: tId, kegiatanId: "" });
                  fetchKegiatanForTeam(tId);
                }}
                required
                disabled={saving}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="">Pilih Tim</option>
                {teams
                  .filter((t) => t.namaTim !== "Pimpinan")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.namaTim}
                    </option>
                  ))}
              </select>
            </div>

            {/* Kegiatan */}
            <div>
              <Label htmlFor="kegiatanId">
                Kegiatan <span className="text-red-500">*</span>
              </Label>
              <select
                id="kegiatanId"
                value={form.kegiatanId}
                onChange={(e) =>
                  setForm({ ...form, kegiatanId: e.target.value })
                }
                disabled={!form.teamId || saving}
                required
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="">
                  {form.teamId ? "Pilih Kegiatan" : "Pilih Tim terlebih dahulu"}
                </option>
                {kegiatan.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.namaKegiatan}
                  </option>
                ))}
              </select>
            </div>

            {/* Deskripsi */}
            <div>
              <Label htmlFor="deskripsi">
                Deskripsi Kegiatan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="deskripsi"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                placeholder="Deskripsi kegiatan..."
                disabled={saving}
                required
              />
            </div>

            {/* Minggu, Bulan, Tahun */}
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
                    setForm({ ...form, minggu: parseInt(e.target.value, 10) })
                  }
                  disabled={saving}
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
                  disabled={saving}
                  className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200"
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
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                Batal
              </Button>
              <Button onClick={save} loading={saving}>
                Simpan
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
