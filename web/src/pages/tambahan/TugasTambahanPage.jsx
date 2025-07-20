import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  showSuccess,
  confirmDelete,
  handleAxiosError,
} from "../../utils/alerts";
import { Plus, Eye, Pencil, Trash2, Check, X } from "lucide-react";
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
import { useRef } from "react";
import { useAuth } from "../auth/useAuth";
import { ROLES } from "../../utils/roles";
import formatDate from "../../utils/formatDate";

export default function TugasTambahanPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [teams, setTeams] = useState([]);
  const [kegiatan, setKegiatan] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    teamId: "",
    kegiatanId: "",
    tanggal: new Date().toISOString().slice(0, 10),
    status: STATUS.BELUM,
    deskripsi: "",
  });
  const [search, setSearch] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear());
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const tanggalRef = useRef(null);
  const { user } = useAuth();
  const [filterTeam, setFilterTeam] = useState("");
  const [filterUser, setFilterUser] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterTeam) params.teamId = filterTeam;
      if (filterUser) params.userId = filterUser;
      const tugasReq =
        user?.role === ROLES.ADMIN
          ? axios.get("/tugas-tambahan/all", { params })
          : axios.get("/tugas-tambahan");

      const [tRes, kRes, teamRes, userRes] = await Promise.all([
        tugasReq,
        axios.get("/master-kegiatan?limit=1000"),
        axios.get("/teams").then(async (res) => {
          if (Array.isArray(res.data) && res.data.length === 0) {
            return axios.get("/teams/member");
          }
          return res;
        }),
        user?.role === ROLES.ADMIN ? axios.get("/users") : Promise.resolve({ data: [] }),
      ]);
      setItems(tRes.data);
      setKegiatan(kRes.data.data || kRes.data);
      setTeams(teamRes.data);
      if (user?.role === ROLES.ADMIN) {
        const sorted = userRes.data
          .filter((u) => u.role !== ROLES.ADMIN && u.role !== ROLES.PIMPINAN)
          .sort((a, b) => a.nama.localeCompare(b.nama));
        setAllUsers(sorted);
        setUsers(sorted);
      }
    } catch (err) {
      handleAxiosError(err, "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterTeam, filterUser, user?.role]);

  useEffect(() => {
    if (filterTeam && user?.role === ROLES.ADMIN) {
      const t = teams.find((tm) => tm.id === parseInt(filterTeam, 10));
      if (t) {
        const mem = t.members
          .map((m) => m.user)
          .filter((u) => u.role !== ROLES.ADMIN && u.role !== ROLES.PIMPINAN);
        const sorted = mem.sort((a, b) => a.nama.localeCompare(b.nama));
        setUsers(sorted);
      }
    } else {
      setUsers(allUsers);
    }
  }, [filterTeam, teams, allUsers, user?.role]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      teamId: "",
      kegiatanId: "",
      tanggal: new Date().toISOString().slice(0, 10),
      status: STATUS.BELUM,
      deskripsi: "",
    });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      teamId: item.teamId,
      kegiatanId: item.kegiatanId,
      tanggal: item.tanggal.slice(0, 10),
      status: item.status,
      deskripsi: item.deskripsi || "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.teamId || !form.kegiatanId || !form.tanggal) return;
    try {
      const payload = { ...form };
      delete payload.teamId;
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });
      if (editing) {
        await axios.put(`/tugas-tambahan/${editing.id}`, payload);
      } else {
        await axios.post("/tugas-tambahan", payload);
      }
      setShowForm(false);
      setEditing(null);
      fetchData();
      showSuccess("Berhasil", "Data disimpan");
    } catch (err) {
      handleAxiosError(err, "Gagal menyimpan");
    }
  };

  const remove = async (item) => {
    const r = await confirmDelete("Hapus kegiatan ini?");
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/tugas-tambahan/${item.id}`);
      fetchData();
      showSuccess("Dihapus", "Kegiatan dihapus");
    } catch (err) {
      handleAxiosError(err, "Gagal menghapus");
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
      const matchUser = filterUser
        ? item.userId === parseInt(filterUser, 10)
        : true;
      return (
        matchesSearch &&
        matchBulan &&
        matchTahun &&
        matchTeam &&
        matchUser
      );
    });
  }, [items, search, filterBulan, filterTahun, filterTeam, filterUser]);

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
      ...(user?.role === ROLES.ADMIN
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
        Header: "Bukti Dukung",
        accessor: (row) => row.buktiLink,
        Cell: ({ row }) =>
          row.original.buktiLink ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <X className="w-4 h-4 text-red-600" />
          ),
        disableFilters: true,
      },
      {
        Header: "Aksi",
        accessor: "id",
        Cell: ({ row }) => (
          <div className="space-x-2">
            <Button onClick={() => openDetail(row.original.id)} icon aria-label="Detail">
              <Eye size={16} />
            </Button>
            <Button
              onClick={() => openEdit(row.original)}
              variant="warning"
              icon
              aria-label="Edit"
            >
              <Pencil size={16} />
            </Button>
            <Button
              onClick={() => remove(row.original)}
              variant="danger"
              icon
              aria-label="Hapus"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
        disableFilters: true,
      },
    ],
    [currentPage, pageSize, openDetail, openEdit, remove, user?.role]
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
          <MonthYearPicker
            month={filterBulan}
            year={filterTahun}
            onMonthChange={setFilterBulan}
            onYearChange={setFilterTahun}
          />
          {user?.role === ROLES.ADMIN && (
            <>
              <select
                value={filterTeam}
                onChange={(e) => {
                  setFilterTeam(e.target.value);
                  setFilterUser("");
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
              <select
                value={filterUser}
                onChange={(e) => {
                  setFilterUser(e.target.value);
                  setCurrentPage(1);
                }}
                className="cursor-pointer border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 dark:hover:border-blue-400 shadow-sm transition duration-150 ease-in-out"
              >
                <option value="">Semua Pegawai</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="flex justify-between items-center">
          <Button onClick={openCreate} className="add-button">
            <Plus size={16} />
            <span className="hidden sm:inline">Tugas Tambahan</span>
          </Button>
        </div>
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
          <DataTable columns={columns} data={paginatedItems} showGlobalFilter={false} showPagination={false} selectable={false} />
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

      {showForm && (
        <Modal
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          titleId="tugas-tambahan-modal-title"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              id="tugas-tambahan-modal-title"
              className="text-xl font-semibold"
            >
              {editing ? "Edit Kegiatan" : "Tambah Kegiatan"}
            </h2>
            <p className="text-xs text-red-600 dark:text-red-500">
              * Fardu 'Ain
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="teamId" className="dark:text-gray-100">
                Tim <span className="text-red-500">*</span>
              </Label>
              <select
                id="teamId"
                value={form.teamId}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({
                    ...form,
                    teamId: value ? parseInt(value, 10) : "",
                    kegiatanId: "", // reset kegiatan saat tim berubah
                  });
                }}
                className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 
            dark:bg-gray-700 dark:text-gray-100 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            shadow-sm transition duration-150 ease-in-out"
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

            <div>
              <Label htmlFor="kegiatanId" className="dark:text-gray-100">
                Kegiatan <span className="text-red-500">*</span>
              </Label>
              <select
                id="kegiatanId"
                value={form.kegiatanId}
                onChange={(e) =>
                  setForm({ ...form, kegiatanId: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 
            dark:bg-gray-700 dark:text-gray-100 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            shadow-sm transition duration-150 ease-in-out"
                disabled={!form.teamId}
              >
                <option value="">
                  {form.teamId ? "Pilih Kegiatan" : "Pilih Tim terlebih dahulu"}
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

            <div>
              <Label htmlFor="kegiatanId" className="dark:text-gray-100">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <Input
                ref={tanggalRef}
                id="tanggal"
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                onClick={() => tanggalRef.current?.showPicker()}
                className="w-full cursor-pointer border rounded-lg px-3 py-2 bg-white text-gray-900 
    dark:bg-gray-700 dark:text-gray-100 
    focus:outline-none focus:ring-2 focus:ring-blue-500 
    shadow-sm transition duration-150 ease-in-out"
              />
            </div>

            <div>
              <Label htmlFor="deskripsi" className="dark:text-gray-100">
                Deskripsi
              </Label>
              <textarea
                id="deskripsi"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 
            dark:bg-gray-700 dark:text-gray-100 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            shadow-sm transition duration-150 ease-in-out resize-none"
              />
            </div>

            <div>
              <Label htmlFor="status" className="dark:text-gray-100">
                Status <span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 
            dark:bg-gray-700 dark:text-gray-100 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            shadow-sm transition duration-150 ease-in-out"
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

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
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
