import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import {
  showSuccess,
  showWarning,
  confirmCancel,
  handleAxiosError,
} from "../../utils/alerts";
import { Plus, Filter as FilterIcon, Eye } from "lucide-react";
import Select from "react-select";
import selectStyles from "../../utils/selectStyles";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import Modal from "../../components/ui/Modal";
import useModalForm from "../../hooks/useModalForm";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import MonthYearPicker from "../../components/ui/MonthYearPicker";
import { ROLES } from "../../utils/roles";
import months from "../../utils/months";
import SearchInput from "../../components/SearchInput";
import SelectDataShow from "../../components/ui/SelectDataShow";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { AnimatePresence, motion as Motion } from "framer-motion";
import Spinner from "../../components/Spinner";
import { STATUS } from "../../utils/status";

const EXCLUDED_TB_NAMES = ["Ayu Pinta Gabina Siregar", "Elly Astutik"];

function sortPenugasan(list, teamId) {
  const dateVal = (p) =>
    p.tahun * 10000 + parseInt(p.bulan, 10) * 100 + p.minggu;
  return [...list].sort((a, b) => {
    if (a.status === STATUS.BELUM && b.status !== STATUS.BELUM) return -1;
    if (b.status === STATUS.BELUM && a.status !== STATUS.BELUM) return 1;
    const diff = dateVal(b) - dateVal(a);
    if (diff !== 0) return diff;
    const aOwn = teamId && a.kegiatan?.teamId === teamId;
    const bOwn = teamId && b.kegiatan?.teamId === teamId;
    if (aOwn && !bOwn) return -1;
    if (bOwn && !aOwn) return 1;
    return 0;
  });
}

const getCurrentWeek = () => {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstMonday = new Date(firstOfMonth);
  firstMonday.setDate(
    firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7)
  );
  const diff = Math.floor((today - firstMonday) / (1000 * 60 * 60 * 24));
  return Math.floor(diff / 7) + 1;
};

export default function PenugasanPage() {
  const { user } = useAuth();
  const canManage = [ROLES.ADMIN, ROLES.KETUA].includes(user?.role);
  const showPegawaiColumn = useMemo(
    () => [ROLES.ADMIN, ROLES.KETUA, ROLES.PIMPINAN].includes(user?.role),
    [user]
  );
  const navigate = useNavigate();

  // --- State
  const [penugasan, setPenugasan] = useState([]);
  const [teams, setTeams] = useState([]);
  const [filterTeam, setFilterTeam] = useState("");
  const [kegiatan, setKegiatan] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // NEW: error state
  const { showForm, form, setForm, openCreate, closeForm, resetForm } =
    useModalForm({
      kegiatanId: "",
      pegawaiIds: [],
      deskripsi: "",
      minggu: getCurrentWeek(),
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
    });
  const [search, setSearch] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear());
  const [filterMinggu, setFilterMinggu] = useState("");
  const [weekOptions, setWeekOptions] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  // Default tab is "Tugas Saya" to show the current user's tasks first
  const [viewTab, setViewTab] = useState("mine");
  const [formTouched, setFormTouched] = useState(false); // for validation

  // --- Ref for initial focus
  const descriptionRef = useRef();

  // --- Fetch Logic
  useEffect(() => {
    const initWeek = async () => {
      try {
        const params = {};
        if (filterBulan) params.bulan = filterBulan;
        if (filterTahun) params.tahun = filterTahun;
        const res = await axios.get("/penugasan", { params });
        const weeks = (res.data || []).map((p) => p.minggu);
        if (weeks.length) {
          const latest = Math.max(...weeks);
          setFilterMinggu(String(latest));
        }
      } catch {
        // ignore error
      }
    };
    if (!filterMinggu) initWeek();
    // eslint-disable-next-line
  }, [filterBulan, filterTahun]);

  useEffect(() => {
    if (!filterBulan || !filterTahun) {
      setWeekOptions([]);
      setFilterMinggu("");
      return;
    }
    const year = parseInt(filterTahun, 10);
    const monthIdx = parseInt(filterBulan, 10) - 1;
    const firstOfMonth = new Date(year, monthIdx, 1);
    const monthEnd = new Date(year, monthIdx + 1, 0);
    const firstMonday = new Date(firstOfMonth);
    firstMonday.setDate(
      firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7)
    );
    const opts = [];
    for (
      let d = new Date(firstMonday);
      d <= monthEnd;
      d.setDate(d.getDate() + 7)
    ) {
      opts.push(opts.length + 1);
    }
    setWeekOptions(opts);
    if (filterMinggu && filterMinggu > opts.length) setFilterMinggu("");
  }, [filterBulan, filterTahun, filterMinggu]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (filterBulan) params.bulan = filterBulan;
      if (filterTahun) params.tahun = filterTahun;
      if (filterMinggu) params.minggu = filterMinggu;
      if (viewTab === "dariSaya") params.creator = user?.id;
      const penugasanReq = axios.get("/penugasan", { params });
      const teamsReq = axios.get("/teams").then(async (res) => {
        if (Array.isArray(res.data) && res.data.length === 0)
          return axios.get("/teams/member");
        return res;
      });
      let usersReq = canManage
        ? axios.get("/users")
        : Promise.resolve({ data: [user] });
      const [pRes, tRes, uRes] = await Promise.all([
        penugasanReq,
        teamsReq,
        usersReq,
      ]);
      let kRes;
      if (user?.role === ROLES.ADMIN) {
        kRes = await axios.get("/master-kegiatan?limit=1000");
      } else if (user?.role === ROLES.KETUA) {
        const tId = tRes.data[0]?.id;
        kRes = tId
          ? await axios.get(`/master-kegiatan?team=${tId}`)
          : { data: { data: [] } };
      } else {
        kRes = { data: { data: [] } };
      }
      setPenugasan(sortPenugasan(pRes.data, user?.teamId));
      setTeams(
        tRes.data.filter(
          (t) => t.namaTim !== "Admin" && t.namaTim !== "Pimpinan"
        )
      );
      setUsers([...uRes.data].sort((a, b) => a.nama.localeCompare(b.nama)));
      const kData = kRes.data.data || kRes.data;
      setKegiatan(
        [...kData].sort((a, b) => a.namaKegiatan.localeCompare(b.namaKegiatan))
      );
    } catch (err) {
      setError("Gagal mengambil data penugasan.");
      handleAxiosError(err, "Gagal mengambil data penugasan");
    } finally {
      setLoading(false);
    }
  }, [user, filterBulan, filterTahun, filterMinggu, canManage, viewTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Form Submit
  const save = async () => {
    setFormTouched(true);
    if (!form.kegiatanId || form.pegawaiIds.length === 0) {
      showWarning("Lengkapi data", "Kegiatan dan pegawai wajib dipilih");
      return;
    }
    try {
      await axios.post("/penugasan/bulk", form);
      closeForm();
      resetForm();
      fetchData();
      showSuccess("Berhasil", "Penugasan ditambah");
    } catch (err) {
      handleAxiosError(err, "Gagal menyimpan penugasan");
    }
  };

  // --- Memoized Data
  const filtered = useMemo(() => {
    return penugasan.filter((p) => {
      const text = `${p.kegiatan?.namaKegiatan || ""} ${
        p.pegawai?.nama || ""
      }`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchTeam = filterTeam
        ? p.kegiatan?.teamId === parseInt(filterTeam, 10)
        : true;
      if (viewTab === "mine") return matchesSearch && p.pegawaiId === user?.id;
      if (viewTab === "dariSaya") return matchesSearch && matchTeam;
      return matchesSearch && matchTeam;
    });
  }, [penugasan, search, viewTab, user?.id, filterTeam]);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize]
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  const columns = useMemo(() => {
    const cols = [
      {
        Header: "No",
        accessor: (_row, i) => (currentPage - 1) * pageSize + i + 1,
      },
      {
        Header: "Kegiatan",
        accessor: (row) => row.kegiatan?.namaKegiatan || "-",
      },
      { Header: "Tim", accessor: (row) => row.kegiatan?.team?.namaTim || "-" },
    ];
    if (showPegawaiColumn) {
      cols.push({
        Header: "Pegawai",
        accessor: (row) => row.pegawai?.nama || "-",
      });
    }
    cols.push(
      { Header: "Minggu", accessor: "minggu" },
      {
        Header: "Bulan",
        accessor: (row) => `${months[row.bulan - 1]} ${row.tahun}`,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        Header: "Aksi",
        accessor: "id",
        Cell: ({ row }) =>
          viewTab === "all" && row.original.pegawaiId !== user?.id ? null : (
            <Button
              onClick={() => navigate(`/tugas-mingguan/${row.original.id}`)}
              variant="icon"
              icon
              aria-label="Detail"
            >
              <Eye size={16} />
            </Button>
          ),
      }
    );
    return cols;
  }, [
    currentPage,
    pageSize,
    navigate,
    showPegawaiColumn,
    viewTab,
    user?.id,
  ]);

  // --- UI

  return (
    <div className="space-y-6">
      {/* TABS */}
      {user?.role !== ROLES.PIMPINAN && (
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="View Tabs"
        >
          {[
            { id: "mine", label: "Tugas Saya" },
            ...(canManage ? [{ id: "dariSaya", label: "Dari Saya" }] : []),
            { id: "all", label: "Semua" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setViewTab(t.id);
                setCurrentPage(1);
              }}
              role="tab"
              aria-selected={viewTab === t.id}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-150 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                viewTab === t.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* FILTERS */}
      <Motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap justify-between items-center gap-2"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari penugasan..."
            ariaLabel="Cari penugasan"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {user?.role === ROLES.PIMPINAN && (
            <select
              value={filterTeam}
              onChange={(e) => {
                setFilterTeam(e.target.value);
                setCurrentPage(1);
              }}
              className="cursor-pointer border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
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
            <Button
              onClick={openCreate}
              className="flex gap-2 items-center shadow-sm"
              variant="primary"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Tugas Mingguan</span>
            </Button>
          )}
        </div>
      </Motion.div>

      {/* TABLE */}
      <div className="overflow-x-auto md:overflow-x-visible min-h-[120px]">
        {loading ? (
          <TableSkeleton cols={columns.length} />
        ) : error ? (
          <div className="py-10 flex flex-col items-center text-red-600 dark:text-red-400">
            <span className="mb-3 text-xl">⚠️</span>
            <span>{error}</span>
            <Button variant="secondary" className="mt-4" onClick={fetchData}>
              Coba Lagi
            </Button>
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-10 flex flex-col items-center text-gray-400 dark:text-gray-500">
            <span className="mb-2 text-2xl">🙁</span>
            <span className="text-sm">Belum ada penugasan ditemukan.</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={paginated}
            showGlobalFilter={false}
            showPagination={false}
            selectable={false}
          />
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
        <SelectDataShow
          pageSize={pageSize}
          setPageSize={setPageSize}
          setCurrentPage={setCurrentPage}
          options={[5, 10, 25, 50]}
          className="flex-1"
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* MODAL FORM */}
      <AnimatePresence>
        {canManage && showForm && (
          <Modal
            onClose={closeForm}
            titleId="penugasan-form-title"
            initialFocusRef={descriptionRef}
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2
                  id="penugasan-form-title"
                  className="text-xl font-semibold mb-2"
                >
                  Tambah Penugasan
                </h2>
                <p className="text-xs text-red-600 dark:text-red-500">
                  * Fardu 'Ain
                </p>
              </div>
              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  save();
                }}
                autoComplete="off"
              >
                {/* Kegiatan */}
                <div>
                  <Label htmlFor="kegiatanId">
                    Kegiatan <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    inputId="kegiatanId"
                    classNamePrefix="react-select"
                    className="mb-1"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    options={kegiatan.map((k) => ({
                      value: k.id,
                      label: k.namaKegiatan,
                    }))}
                    value={
                      form.kegiatanId
                        ? {
                            value: form.kegiatanId,
                            label: kegiatan.find(
                              (k) => k.id === form.kegiatanId
                            )?.namaKegiatan,
                          }
                        : null
                    }
                    onChange={(o) =>
                      setForm({
                        ...form,
                        kegiatanId: o ? parseInt(o.value, 10) : "",
                      })
                    }
                    placeholder="Pilih kegiatan..."
                    isSearchable
                    noOptionsMessage={() => "Tidak ditemukan."}
                  />
                  {formTouched && !form.kegiatanId && (
                    <span className="text-xs text-red-500">
                      Kegiatan wajib dipilih
                    </span>
                  )}
                </div>
                {/* Pegawai */}
                <div>
                  <Label htmlFor="pegawaiIds">
                    Pegawai <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    inputId="pegawaiIds"
                    isMulti
                    classNamePrefix="react-select"
                    className="mb-1"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    options={users
                      .filter(
                        (u) =>
                          u.role !== ROLES.ADMIN &&
                          u.role !== ROLES.PIMPINAN &&
                          !EXCLUDED_TB_NAMES.includes(u.nama)
                      )
                      .map((u) => ({ value: u.id, label: `${u.nama}` }))}
                    value={form.pegawaiIds
                      .map((id) => {
                        const u = users.find((x) => x.id === id);
                        return u ? { value: u.id, label: u.nama } : null;
                      })
                      .filter(Boolean)}
                    onChange={(vals) =>
                      setForm({
                        ...form,
                        pegawaiIds: vals
                          ? vals.map((v) => parseInt(v.value, 10))
                          : [],
                      })
                    }
                    placeholder="Pilih pegawai..."
                    isSearchable
                    noOptionsMessage={() => "Tidak ditemukan."}
                  />
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() =>
                      setForm({
                        ...form,
                        pegawaiIds: users
                          .filter(
                            (u) =>
                              u.role !== ROLES.ADMIN &&
                              u.role !== ROLES.PIMPINAN &&
                              !EXCLUDED_TB_NAMES.includes(u.nama)
                          )
                          .map((u) => u.id),
                      })
                    }
                  >
                    Pilih Semua
                  </Button>
                  {formTouched && form.pegawaiIds.length === 0 && (
                    <span className="text-xs text-red-500">
                      Pegawai wajib dipilih
                    </span>
                  )}
                </div>
                {/* Deskripsi */}
                <div>
                  <Label htmlFor="deskripsi">Deskripsi Penugasan</Label>
                  <textarea
                    id="deskripsi"
                    ref={descriptionRef}
                    value={form.deskripsi}
                    onChange={(e) =>
                      setForm({ ...form, deskripsi: e.target.value })
                    }
                    className="form-input resize-y w-full min-h-[48px] border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
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
                      value={form.minggu}
                      min="1"
                      max="6"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          minggu: parseInt(e.target.value, 10),
                        })
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
                        setForm({
                          ...form,
                          bulan: parseInt(e.target.value, 10),
                        })
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
                          tahun: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={async () => {
                      const r = await confirmCancel(
                        "Batalkan penambahan penugasan?"
                      );
                      if (r.isConfirmed) closeForm();
                    }}
                  >
                    Batal
                  </Button>
                  <Button type="submit" variant="primary">
                    Simpan
                  </Button>
                </div>
              </form>
            </Motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
