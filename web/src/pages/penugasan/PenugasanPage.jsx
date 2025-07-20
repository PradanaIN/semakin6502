import { useEffect, useState, useCallback, useMemo } from "react";
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

const EXCLUDED_TB_NAMES = ["Ayu Pinta Gabina Siregar", "Elly Astutik"];

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
  const canManage = [ROLES.ADMIN, ROLES.KETUA, ROLES.PIMPINAN].includes(
    user?.role
  );
  const showPegawaiColumn = useMemo(
    () => [ROLES.ADMIN, ROLES.KETUA].includes(user?.role),
    [user]
  );
  const navigate = useNavigate();
  const [penugasan, setPenugasan] = useState([]);
  const [kegiatan, setKegiatan] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showForm, form, setForm, openCreate, closeForm } = useModalForm({
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
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const penugasanReq = axios.get(
        `/penugasan?bulan=${filterBulan || ""}&tahun=${filterTahun || ""}`
      );
      const teamsReq = axios.get("/teams").then(async (res) => {
        if (Array.isArray(res.data) && res.data.length === 0) {
          return axios.get("/teams/member");
        }
        return res;
      });

      let usersReq;
      if (canManage) {
        usersReq = axios.get("/users");
      } else {
        // anggota hanya membutuhkan datanya sendiri untuk menampilkan nama
        usersReq = Promise.resolve({ data: [user] });
      }

      const [pRes, tRes, uRes] = await Promise.all([
        penugasanReq,
        teamsReq,
        usersReq,
      ]);

      let kRes;
      if (user?.role === ROLES.ADMIN) {
        kRes = await axios.get("/master-kegiatan?limit=1000");
      } else {
        const tId = tRes.data[0]?.id;
        if (tId) {
          kRes = await axios.get(`/master-kegiatan?team=${tId}`);
        } else {
          kRes = { data: { data: [] } };
        }
      }

      setPenugasan(pRes.data);
      const sortedUsers = [...uRes.data].sort((a, b) =>
        a.nama.localeCompare(b.nama)
      );
      setUsers(sortedUsers);
      const kData = kRes.data.data || kRes.data;
      const sortedKegiatan = [...kData].sort((a, b) =>
        a.namaKegiatan.localeCompare(b.namaKegiatan)
      );
      setKegiatan(sortedKegiatan);
    } catch (err) {
      handleAxiosError(err, "Gagal mengambil data penugasan");
    } finally {
      setLoading(false);
    }
  }, [user, filterBulan, filterTahun, canManage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const save = async () => {
    if (!form.kegiatanId || form.pegawaiIds.length === 0) {
      showWarning("Lengkapi data", "Kegiatan dan pegawai wajib dipilih");
      return;
    }
    try {
      await axios.post("/penugasan/bulk", form);
      closeForm();
      fetchData();
      showSuccess("Berhasil", "Penugasan ditambah");
    } catch (err) {
      handleAxiosError(err, "Gagal menyimpan penugasan");
    }
  };

  const filtered = useMemo(() => {
    return penugasan.filter((p) => {
      const text = `${p.kegiatan?.namaKegiatan || ""} ${
        p.pegawai?.nama || ""
      }`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [penugasan, search]);

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
        disableFilters: true,
      },
      {
        Header: "Kegiatan",
        accessor: (row) => row.kegiatan?.namaKegiatan || "-",
        disableFilters: true,
      },
      {
        Header: "Tim",
        accessor: (row) => row.kegiatan?.team?.namaTim || "-",
        disableFilters: true,
      },
    ];

    if (showPegawaiColumn) {
      cols.push({
        Header: "Pegawai",
        accessor: (row) => row.pegawai?.nama || "-",
        disableFilters: true,
      });
    }

    cols.push(
      { Header: "Minggu", accessor: "minggu", disableFilters: true },
      {
        Header: "Bulan",
        accessor: (row) => `${months[row.bulan - 1]} ${row.tahun}`,
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
          <Button
            onClick={() => navigate(`/tugas-mingguan/${row.original.id}`)}
            variant="icon"
            icon
            aria-label="Detail"
          >
            <Eye size={16} />
          </Button>
        ),
        disableFilters: true,
      }
    );

    return cols;
  }, [currentPage, pageSize, navigate, showPegawaiColumn]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2">
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
          <MonthYearPicker
            month={filterBulan}
            year={filterTahun}
            onMonthChange={(val) => {
              setFilterBulan(val);
              setCurrentPage(1);
            }}
            onYearChange={(val) => {
              setFilterTahun(val);
              setCurrentPage(1);
            }}
          />
        </div>
        {canManage && (
          <Button onClick={openCreate} className="add-button">
            <Plus size={16} />
            <span className="hidden sm:inline">Tugas Mingguan</span>
          </Button>
        )}
      </div>

      <div className="overflow-x-auto md:overflow-x-visible">
        {loading ? (
          <div className="py-6 text-center text-gray-600 dark:text-gray-300">
            <div className="flex flex-col items-center space-y-2">
              <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.93 6.364A8.001 8.001 0 0112 20v4c-6.627 0-12-5.373-12-12h4a8.001 8.001 0 006.364 2.93z"></path>
              </svg>
              <span className="text-sm font-medium tracking-wide">Memuat data...</span>
            </div>
          </div>
        ) : (
          <DataTable columns={columns} data={paginated} showGlobalFilter={false} showPagination={false} selectable={false} />
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
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

      {canManage && showForm && (
        <Modal onClose={closeForm} titleId="penugasan-form-title">
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
          <div className="space-y-2">
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
                        label: kegiatan.find((k) => k.id === form.kegiatanId)
                          ?.namaKegiatan,
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
            </div>
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
              <button
                type="button"
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
                className="mt-1 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded"
              >
                Pilih Semua
              </button>
            </div>
            <div>
              <Label htmlFor="deskripsi">Deskripsi Penugasan</Label>
              <textarea
                id="deskripsi"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
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
                  max="6"
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
                  const r = await confirmCancel(
                    "Batalkan penambahan penugasan?"
                  );
                  if (r.isConfirmed) closeForm();
                }}
              >
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
