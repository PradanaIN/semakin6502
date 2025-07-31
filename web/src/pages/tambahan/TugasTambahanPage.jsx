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
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import MonthYearPicker from "../../components/ui/MonthYearPicker";
import Select from "react-select";
import { STATUS, formatStatus } from "../../utils/status";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/Pagination";
import SelectDataShow from "../../components/ui/SelectDataShow";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { useRef } from "react";
import { useAuth } from "../auth/useAuth";
import { ROLES } from "../../utils/roles";
import formatDate from "../../utils/formatDate";

function sortTambahan(list, teamId) {
  return [...list].sort((a, b) => {
    if (a.status === STATUS.BELUM && b.status !== STATUS.BELUM) return -1;
    if (b.status === STATUS.BELUM && a.status !== STATUS.BELUM) return 1;
    const dateDiff = new Date(b.tanggal) - new Date(a.tanggal);
    if (dateDiff !== 0) return dateDiff;
    const aOwn = teamId && a.teamId === teamId;
    const bOwn = teamId && b.teamId === teamId;
    if (aOwn && !bOwn) return -1;
    if (bOwn && !aOwn) return 1;
    return 0;
  });
}

export default function TugasTambahanPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [teams, setTeams] = useState([]);
  const [kegiatan, setKegiatan] = useState([]);
  const [form, setForm] = useState({
    teamId: "",
    kegiatanId: "",
    tanggal: new Date().toISOString().slice(0, 10),
    status: STATUS.BELUM,
    deskripsi: "",
    capaianKegiatan: "",
  });
  const [search, setSearch] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear());
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const tanggalRef = useRef(null);
  const { user } = useAuth();
  const canManage = user?.role !== ROLES.PIMPINAN;
  const [filterTeam, setFilterTeam] = useState("");
  const [filterMinggu, setFilterMinggu] = useState("");
  const [weekOptions, setWeekOptions] = useState([]);
  const fetchKegiatanForTeam = async (teamId) => {
    if (!teamId) {
      setKegiatan([]);
      return;
    }
    try {
      const res = await axios.get(`/master-kegiatan?team=${teamId}`);
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

  const openCreate = () => {
    setForm({
      teamId: "",
      kegiatanId: "",
      tanggal: new Date().toISOString().slice(0, 10),
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
      !form.tanggal ||
      form.deskripsi.trim() === "" ||
      form.capaianKegiatan.trim() === "" ||
      !form.status ||
      (form.status === STATUS.SELESAI_DIKERJAKAN && !form.buktiLink)
    ) {
      showWarning("Lengkapi data", "Semua kolom wajib diisi");
      return;
    }
    try {
      const payload = { ...form };
      delete payload.teamId;
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });
      await axios.post("/tugas-tambahan", payload);
      setShowForm(false);
      fetchData();
      showSuccess("Berhasil", "Data disimpan");
    } catch (err) {
      handleAxiosError(err, "Gagal menyimpan");
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
      const matchTeam = filterTeam
        ? item.teamId === parseInt(filterTeam, 10)
        : true;
      let matchMinggu = true;
      if (filterMinggu && filterBulan && filterTahun) {
        const year = parseInt(filterTahun, 10);
        const monthIdx = parseInt(filterBulan, 10) - 1;
        const firstOfMonth = new Date(year, monthIdx, 1);
        const firstMonday = new Date(firstOfMonth);
        firstMonday.setDate(
          firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7)
        );
        const diffDays = Math.floor(
          (date - firstMonday) / (7 * 24 * 60 * 60 * 1000)
        );
        const weekNum = diffDays + 1;
        matchMinggu = weekNum === parseInt(filterMinggu, 10);
      }
      return (
        matchesSearch && matchBulan && matchTahun && matchTeam && matchMinggu
      );
    });
  }, [items, search, filterBulan, filterTahun, filterTeam, filterMinggu]);

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;

  const columns = useMemo(
    () => [
      {
        Header: "No",
        accessor: (_row, i) => (currentPage - 1) * pageSize + i + 1,
        disableFilters: true,
      },
      { Header: "Kegiatan", accessor: "nama", disableFilters: true },
      {
        Header: "Tim",
        accessor: (row) => row.kegiatan.team?.namaTim || "-",
        disableFilters: true,
      },
      ...([ROLES.ADMIN, ROLES.PIMPINAN].includes(user?.role)
        ? [
            {
              Header: "Nama",
              accessor: (row) => row.user?.nama || "-",
              disableFilters: true,
            },
          ]
        : []),
      {
        Header: "Tanggal",
        accessor: (row) => formatDate(row.tanggal),
        disableFilters: true,
      },
      {
        Header: "Deskripsi",
        accessor: (row) => row.deskripsi || "-",
        disableFilters: true,
      },
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
          <div className="space-x-2">
            <Button
              onClick={() => openDetail(row.original.id)}
              icon
              aria-label="Detail"
            >
              <Eye size={16} />
            </Button>
          </div>
        ),
        disableFilters: true,
      },
    ],
    [currentPage, pageSize, openDetail, user?.role]
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
                setCurrentPage(1);
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

      <div className="overflow-x-auto md:overflow-x-visible">
        {loading ? (
          <TableSkeleton cols={columns.length} />
        ) : (
          <DataTable
            columns={columns}
            data={paginatedItems}
            showGlobalFilter={false}
            showPagination={false}
            selectable={false}
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <SelectDataShow
          pageSize={pageSize}
          setPageSize={setPageSize}
          setCurrentPage={setCurrentPage}
          options={[5, 10, 25, 50]}
          className="w-32"
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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
                  const tId = e.target.value ? parseInt(e.target.value) : "";
                  setForm({ ...form, teamId: tId, kegiatanId: "" });
                  fetchKegiatanForTeam(tId);
                }}
                required
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
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
                disabled={!form.teamId}
                required
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">
                  {form.teamId
                    ? "Pilih Kegiatan"
                    : "Pilih Tim terlebih dahulu"}
                </option>
                {kegiatan
                  .filter((k) => k.teamId === form.teamId)
                  .map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.namaKegiatan}
                    </option>
                  ))}
              </select>
            </div>

            {/* Tanggal */}
            <div>
              <Label htmlFor="tanggal">
                Tanggal Kegiatan <span className="text-red-500">*</span>
              </Label>
              <input
                ref={tanggalRef}
                id="tanggal"
                type="date"
                value={form.tanggal}
                onChange={(e) =>
                  setForm({ ...form, tanggal: e.target.value })
                }
                onClick={() => tanggalRef.current?.showPicker()}
                required
                className="w-full cursor-pointer rounded-md border px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <Label htmlFor="deskripsi">
                Deskripsi Kegiatan <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="deskripsi"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                placeholder="Deskripsi kegiatan..."
                required
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-700 dark:text-white resize-y"
              />
            </div>

            {/* Capaian */}
            <div>
              <Label htmlFor="capaianKegiatan">
                Capaian Kegiatan <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="capaianKegiatan"
                value={form.capaianKegiatan}
                onChange={(e) =>
                  setForm({ ...form, capaianKegiatan: e.target.value })
                }
                placeholder="Capaian kegiatan..."
                required
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-700 dark:text-white resize-y"
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
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

            {/* Link Bukti (Jika selesai) */}
            {form.status === STATUS.SELESAI_DIKERJAKAN && (
              <div>
                <Label htmlFor="buktiLink">
                  Link Bukti <span className="text-red-500">*</span>
                </Label>
                <input
                  id="buktiLink"
                  type="url"
                  value={form.buktiLink}
                  onChange={(e) =>
                    setForm({ ...form, buktiLink: e.target.value })
                  }
                  placeholder="https://..."
                  required
                  className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={handleCancel}>
                Batal
              </Button>
              <Button onClick={save}>Simpan</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
