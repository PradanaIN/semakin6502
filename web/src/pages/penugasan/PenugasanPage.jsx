import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  showSuccess,
  showError,
  showWarning,
  confirmCancel,
} from "../../utils/alerts";
import { Plus, Filter as FilterIcon, Eye } from "lucide-react";
import Select from "react-select";
import selectStyles from "../../utils/selectStyles";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import tableStyles from "../../components/ui/Table.module.css";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import MonthYearPicker from "../../components/ui/MonthYearPicker";
import { ROLES } from "../../utils/roles";
import months from "../../utils/months";
import SearchInput from "../../components/SearchInput";


export default function PenugasanPage() {
  const { user } = useAuth();
  const canManage = [ROLES.ADMIN, ROLES.KETUA, ROLES.PIMPINAN].includes(user?.role);
  const navigate = useNavigate();
  const [penugasan, setPenugasan] = useState([]);
  const [kegiatan, setKegiatan] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    kegiatanId: "",
    pegawaiIds: [],
    deskripsi: "",
    minggu: 1,
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
      const teamsReq = axios.get("/teams");

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
        kRes = await axios.get("/master-kegiatan");
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
        a.nama_kegiatan.localeCompare(b.nama_kegiatan)
      );
      setKegiatan(sortedKegiatan);
    } catch (err) {
      console.error("Gagal mengambil data penugasan", err);
    } finally {
      setLoading(false);
    }
  }, [user, filterBulan, filterTahun, canManage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setForm({
      kegiatanId: "",
      pegawaiIds: [],
      deskripsi: "",
      minggu: 1,
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.kegiatanId || form.pegawaiIds.length === 0) {
      showWarning("Lengkapi data", "Kegiatan dan pegawai wajib dipilih");
      return;
    }
    try {
      await axios.post("/penugasan/bulk", form);
      setShowForm(false);
      fetchData();
      showSuccess("Berhasil", "Penugasan ditambah");
    } catch (err) {
      console.error("Gagal menyimpan penugasan", err);
      showError("Error", "Gagal menyimpan penugasan");
    }
  };


  const filtered = useMemo(() => {
    return penugasan.filter((p) => {
      const text = `${p.kegiatan?.nama_kegiatan || ""} ${p.pegawai?.nama || ""}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [penugasan, search]);

  const paginated = useMemo(
    () =>
      filtered.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ),
    [filtered, currentPage, pageSize]
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;


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
          <button
            type="button"
            onClick={fetchData}
            className="icon-button bg-gray-200 dark:bg-gray-700"
            aria-label="Filter"
          >
            <FilterIcon size={16} />
          </button>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="add-button">
            <Plus size={16} />
            <span className="hidden sm:inline">Tambah Penugasan</span>
          </Button>
        )}
      </div>

      <Table>
        <thead>
          <tr className={tableStyles.headerRow}>
            <th className="px-1 py-1 sm:px-2 sm:py-2">No</th>
            <th className={tableStyles.cell}>Kegiatan</th>
            <th className={tableStyles.cell}>Tim</th>
            <th className={tableStyles.cell}>Pegawai</th>
            <th className={tableStyles.cell}>Minggu</th>
            <th className={tableStyles.cell}>Status</th>
            <th className="px-1 py-1 sm:px-2 sm:py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="py-4 text-center">
                Memuat data...
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-4 text-center">
                Data tidak ditemukan
              </td>
            </tr>
          ) : (
              paginated.map((p, idx) => (
                  <tr key={p.id} className={`${tableStyles.row} border-t dark:border-gray-700 text-center`}>
                  <td className="px-1 py-1 sm:px-2 sm:py-2">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className={tableStyles.cell}>{p.kegiatan?.nama_kegiatan || "-"}</td>
                  <td className={tableStyles.cell}>{p.kegiatan?.team?.nama_tim || "-"}</td>
                  <td className={tableStyles.cell}>{p.pegawai?.nama || "-"}</td>
                  <td className={tableStyles.cell}>{p.minggu}</td>
                  <td className={tableStyles.cell}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-1 py-1 sm:px-2 sm:py-2">
                    <Button
                      onClick={() => navigate(`/tugas-mingguan/${p.id}`)}
                      variant="icon"
                      icon
                      aria-label="Detail"
                    >
                      <Eye size={16} />
                    </Button>
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </Table>

      <div className="flex items-center justify-between mt-4">
        <div className="space-x-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200"
          >
            {[5, 10, 25].map((n) => (
              <option key={n} value={n} className="text-gray-900 dark:text-gray-200">
                {n}
              </option>
            ))}
          </select>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {canManage && showForm && (
        <Modal
          onClose={() => {
            setShowForm(false);
          }}
          titleId="penugasan-form-title"
        >
          <h2 id="penugasan-form-title" className="text-xl font-semibold mb-2">Tambah Penugasan</h2>
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
                  options={kegiatan.map((k) => ({ value: k.id, label: k.nama_kegiatan }))}
                  value={
                    form.kegiatanId
                      ? {
                          value: form.kegiatanId,
                          label: kegiatan.find((k) => k.id === form.kegiatanId)?.nama_kegiatan,
                        }
                      : null
                  }
                  onChange={(o) =>
                    setForm({ ...form, kegiatanId: o ? parseInt(o.value, 10) : "" })
                  }
                  placeholder="Pilih kegiatan..."
                  isSearchable
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
                  .filter((u) => u.role !== ROLES.ADMIN)
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
                      pegawaiIds: vals ? vals.map((v) => parseInt(v.value, 10)) : [],
                    })
                  }
                  placeholder="Pilih pegawai..."
                  isSearchable
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      pegawaiIds: users.filter((u) => u.role !== ROLES.ADMIN).map((u) => u.id),
                    })
                  }
                  className="mt-1 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded"
                >
                  Pilih Semua
                </button>
              </div>
            <div>
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <textarea
                id="deskripsi"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                className="form-input"
              />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="minggu">Minggu</Label>
                  <Input
                    id="minggu"
                    type="number"
                    value={form.minggu}
                    min="1"
                    max="5"
                    onChange={(e) => setForm({ ...form, minggu: parseInt(e.target.value, 10) })}
                    className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="bulan">Bulan</Label>
                  <select
                    id="bulan"
                    value={form.bulan}
                    onChange={(e) => setForm({ ...form, bulan: parseInt(e.target.value, 10) })}
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
                  <Label htmlFor="tahun">Tahun</Label>
                  <Input
                    id="tahun"
                    type="number"
                    value={form.tahun}
                    onChange={(e) => setForm({ ...form, tahun: parseInt(e.target.value, 10) })}
                    className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  const r = await confirmCancel(
                    "Batalkan penambahan penugasan?",
                  );
                  if (r.isConfirmed) setShowForm(false);
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
