import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, ExternalLink, Minus } from "lucide-react";
import { FaFileExcel } from "react-icons/fa";
import Spinner from "../../components/Spinner";
import {
  showSuccess,
  showError,
  showWarning,
  handleAxiosError,
  confirmCancel,
} from "../../utils/alerts";
import Pagination from "../../components/Pagination";
import Modal from "../../components/ui/Modal";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import { STATUS, formatStatus } from "../../utils/status";
import StatusBadge from "../../components/ui/StatusBadge";
import SearchInput from "../../components/SearchInput";
import SelectDataShow from "../../components/ui/SelectDataShow";
import MonthYearPicker from "../../components/ui/MonthYearPicker";
import TableSkeleton from "../../components/ui/TableSkeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../auth/useAuth";
import { ROLES } from "../../utils/roles";
import ExportModal from "../../components/ExportModal";
import exportFileName from "../../utils/exportFileName";
import confirmAlert from "../../utils/confirmAlert";
import formatDate from "../../utils/formatDate";
import { getWeekOfMonth } from "../../utils/dateUtils";

export default function LaporanHarianPage() {
  const { user } = useAuth();
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [bulan, setBulan] = useState("");
  const [minggu, setMinggu] = useState("");
  const [weekOptions, setWeekOptions] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [form, setForm] = useState({
    id: null,
    tanggal: new Date().toISOString().slice(0, 10),
    deskripsi: "",
    status: STATUS.BELUM,
    buktiLink: "",
    catatan: "",
  });

  useEffect(() => {
    if (!bulan) {
      setWeekOptions([]);
      return;
    }
    const year = new Date().getFullYear();
    const monthIdx = bulan - 1;
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
    if (minggu && minggu > opts.length) setMinggu("");
  }, [bulan, minggu]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const isAdmin = user?.role === ROLES.ADMIN;
      const url = isAdmin
        ? "/laporan-harian/all"
        : "/laporan-harian/mine/filter";
      const params = {};
      if (!isAdmin) {
        if (bulan) params.bulan = bulan;
        if (minggu) params.minggu = minggu;
        params.tambahan = true;
      }
      const res = await axios.get(url, { params });
      const contentType = res.headers["content-type"];
      if (!contentType || !contentType.includes("application/json")) {
        if (res.status === 401) {
          window.location.href = "/login";
        } else {
          handleAxiosError(new Error(), "Respon server tidak valid");
        }
        setLaporan([]);
        return;
      }
      const data = res.data;
      if (Array.isArray(data)) {
        setLaporan(data);
      } else {
        console.warn("Unexpected payload shape:", data);
        showWarning("Peringatan", "Format data laporan tidak valid");
        setLaporan([]);
      }
    } catch (err) {
      handleAxiosError(err, "Gagal mengambil laporan");
    } finally {
      setLoading(false);
    }
  };

  const saveForm = async () => {
    try {
      setSaving(true);
      if (
        (form.status === STATUS.SEDANG_DIKERJAKAN ||
          form.status === STATUS.SELESAI_DIKERJAKAN) &&
        !form.buktiLink.trim()
      ) {
        showWarning("Lengkapi data", "Link bukti wajib diisi");
        return;
      }
      if (form.id) {
        await axios.put(`/laporan-harian/${form.id}`, form);
      }
      setShowForm(false);
      fetchData();
      showSuccess("Berhasil", "Laporan diperbarui");
    } catch (err) {
      handleAxiosError(err, "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const exportExcel = async (params = {}) => {
    try {
      const res = await axios.get("/laporan-harian/mine/export", {
        params: { ...params, tambahan: true },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const idx = params.bulan ? parseInt(params.bulan, 10) : undefined;
      const name = `${exportFileName(
        "LaporanHarian",
        idx,
        params.minggu
      )}.xlsx`;

      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSuccess("Berhasil", "Export berhasil disimpan");
    } catch (err) {
      handleAxiosError(err, "Gagal mengekspor");
    }
  };

  const openExportModal = () => setShowExport(true);
  const handleExportConfirm = async (params) => {
    const check = {};
    if (params.tanggal) {
      const d = new Date(params.tanggal);
      check.bulan = d.getMonth() + 1;
      check.minggu = getWeekOfMonth(d);
    } else {
      if (params.bulan) check.bulan = params.bulan;
      if (params.minggu) check.minggu = params.minggu;
    }
    try {
      const res = await axios.get("/laporan-harian/mine/filter", {
        params: { ...check, tambahan: true },
      });
      if (!res.data.length) {
        showError("Gagal", "Tidak ada data untuk diekspor");
        return;
      }
      const r = await confirmAlert({
        title: "Apakah Anda ingin mengekspor data ini?",
        icon: "question",
        confirmButtonText: "Export",
      });
      if (!r.isConfirmed) return;
      await exportExcel(params);
    } catch (err) {
      handleAxiosError(err, "Gagal mengekspor");
    } finally {
      setShowExport(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user, bulan, minggu]);

  const filtered = laporan.filter((l) => {
    const peg = l.pegawai?.nama?.toLowerCase() || "";
    const keg =
      l.penugasan?.kegiatan?.namaKegiatan?.toLowerCase() ||
      l.nama?.toLowerCase() ||
      "";
    const desc = l.deskripsi?.toLowerCase() || "";
    const cat = l.catatan?.toLowerCase() || "";
    const stat = l.status.toLowerCase();
    const txt = `${peg} ${keg} ${desc} ${cat} ${stat}`;
    return txt.includes(query.toLowerCase());
  });

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "-";
    return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
  };

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  const columns = [
    {
      Header: "No",
      accessor: (_row, i) => (currentPage - 1) * pageSize + i + 1,
      disableFilters: true,
    },
    {
      Header: "Jenis",
      accessor: (row) =>
        row.type === "tambahan" || row.tambahan
          ? "Tugas Tambahan"
          : "Tugas Mingguan",
      disableFilters: true,
    },
    {
      Header: "Kegiatan",
      accessor: (row) =>
        row.penugasan?.kegiatan?.namaKegiatan ||
        row.tambahan?.nama ||
        row.nama ||
        "-",
      disableFilters: true,
    },
    {
      Header: "Tim",
      accessor: (row) =>
        row.penugasan?.kegiatan?.team?.namaTim ||
        row.penugasan?.tim?.namaTim ||
        row.tambahan?.kegiatan?.team?.namaTim ||
        row.kegiatan?.team?.namaTim ||
        "-",
      disableFilters: true,
    },
    {
      Header: "Tanggal",
      accessor: (row) => formatDate(row.tanggal, "-"),
      disableFilters: true,
    },
    {
      Header: "Deskripsi Kegiatan",
      accessor: (row) =>
        truncateText(
          row.penugasan?.kegiatan?.deskripsi ||
            row.tambahan?.kegiatan?.deskripsi ||
            row.deskripsi ||
            "-"
        ),
      disableFilters: true,
    },
    {
      Header: "Capaian Kegiatan",
      accessor: (row) => truncateText(row.capaianKegiatan || "-"),
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
      accessor: (row) => row.buktiLink,
      Cell: ({ row }) =>
        row.original.buktiLink ? (
          <a href={row.original.buktiLink} target="_blank" rel="noreferrer">
            <ExternalLink
              size={16}
              className="mx-auto text-blue-600 dark:text-blue-400"
            />
          </a>
        ) : (
          <Minus className="w-4 h-4 mx-auto text-gray-500" />
        ),
      disableFilters: true,
      cellClassName: "text-center",
    },
    {
      Header: "Catatan",
      accessor: (row) => truncateText(row.catatan || "-"),
      disableFilters: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-[200px]">
          <SearchInput
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari..."
            ariaLabel="Cari"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Picker */}
          <MonthYearPicker
            month={bulan}
            onMonthChange={(val) => {
              setBulan(val);
              setCurrentPage(1);
            }}
          />

          {/* Week Selector */}
          <select
            value={minggu}
            onChange={(e) => {
              setMinggu(e.target.value);
              setCurrentPage(1);
            }}
            className="cursor-pointer border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            <option value="">Minggu</option>
            {weekOptions.map((m) => (
              <option key={m} value={m}>
                Minggu {m}
              </option>
            ))}
          </select>

          {/* Export Excel Button */}
          <Button
            onClick={openExportModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition duration-150 ease-in-out"
          >
            <FaFileExcel size={16} />
            <span className="hidden sm:inline">.xlsx</span>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto md:overflow-x-visible min-h-[120px]">
        {loading ? (
          <TableSkeleton cols={columns.length} />
        ) : paginated.length === 0 ? (
          <EmptyState message="Belum ada laporan untuk periode ini" />
        ) : (
          <DataTable
            columns={columns}
            data={paginated}
            showGlobalFilter={false}
            showPagination={false}
            selectable={false}
          />
        )}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between mt-2">
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
        )}
      </div>

      {showForm && (
        <Modal
          onClose={() => setShowForm(false)}
          titleId="laporan-harian-form-title"
        >
          <h3 id="laporan-harian-form-title" className="text-lg font-semibold">
            Edit Laporan Harian
          </h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor="tanggal">
                Tanggal<span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal"
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="deskripsi">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="deskripsi"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                className="form-input"
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="status">
                Status<span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="form-input"
                disabled={saving}
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
            {(form.status === STATUS.SEDANG_DIKERJAKAN ||
              form.status === STATUS.SELESAI_DIKERJAKAN) && (
              <div>
                <Label htmlFor="buktiLink">Link Bukti</Label>
                <Input
                  id="buktiLink"
                  type="text"
                  value={form.buktiLink}
                  onChange={(e) =>
                    setForm({ ...form, buktiLink: e.target.value })
                  }
                  required
                  disabled={saving}
                />
              </div>
            )}
            <div>
              <Label htmlFor="catatan">Catatan</Label>
              <textarea
                id="catatan"
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                className="form-input"
                disabled={saving}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="secondary"
              onClick={async () => {
                const r = await confirmCancel("Batalkan perubahan?");
                if (r.isConfirmed) setShowForm(false);
              }}
              disabled={saving}
            >
              Batal
            </Button>
            <Button onClick={saveForm} loading={saving}>
              Simpan
            </Button>
          </div>
        </Modal>
      )}

      {showExport && (
        <ExportModal
          onClose={() => setShowExport(false)}
          onConfirm={handleExportConfirm}
        />
      )}
    </div>
  );
}
