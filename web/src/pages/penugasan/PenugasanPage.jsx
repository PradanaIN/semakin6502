import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Plus, Search, Filter as FilterIcon, Eye } from "lucide-react";
import Select from "react-select";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import Modal from "../../components/ui/Modal";
import { ROLES } from "../../utils/roles";
import months from "../../utils/months";

const selectStyles = {
  option: (base) => ({ ...base, color: "#000" }),
  valueContainer: (base) => ({ ...base, maxHeight: "100px", overflowY: "auto" }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

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
      Swal.fire("Lengkapi data", "Kegiatan dan pegawai wajib dipilih", "warning");
      return;
    }
    try {
      await axios.post("/penugasan/bulk", form);
      setShowForm(false);
      fetchData();
      Swal.fire("Berhasil", "Penugasan ditambah", "success");
    } catch (err) {
      console.error("Gagal menyimpan penugasan", err);
      Swal.fire("Error", "Gagal menyimpan penugasan", "error");
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
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 dark:text-gray-300" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari penugasan..."
              className="w-full border rounded-md py-[4px] pl-10 pr-3 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterBulan}
            onChange={(e) => {
              setFilterBulan(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-2 py-[4px] bg-white dark:bg-gray-700 dark:text-gray-200"
          >
            <option value="">Bulan</option>
            {months.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            value={filterTahun}
            onChange={(e) => {
              setFilterTahun(parseInt(e.target.value, 10));
              setCurrentPage(1);
            }}
            className="w-20 border rounded px-2 py-[4px] bg-white dark:bg-gray-700 dark:text-gray-200"
          />
          <button
            type="button"
            onClick={fetchData}
            className="px-3 py-[4px] bg-gray-200 dark:bg-gray-700 rounded"
          >
            <FilterIcon size={16} />
          </button>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Tambah Penugasan</span>
          </button>
        )}
      </div>

      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-center text-sm uppercase">
            <th className="px-2 py-2">No</th>
            <th className="px-4 py-2">Kegiatan</th>
            <th className="px-4 py-2">Tim</th>
            <th className="px-4 py-2">Pegawai</th>
            <th className="px-4 py-2">Minggu</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-2 py-2">Aksi</th>
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
                <tr key={p.id} className="border-t dark:border-gray-700 text-center">
                  <td className="px-2 py-2">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-4 py-2">{p.kegiatan?.nama_kegiatan || "-"}</td>
                  <td className="px-4 py-2">{p.kegiatan?.team?.nama_tim || "-"}</td>
                  <td className="px-4 py-2">{p.pegawai?.nama || "-"}</td>
                  <td className="px-4 py-2">{p.minggu}</td>
                  <td className="px-4 py-2">{p.status}</td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => navigate(`/tugas-mingguan/${p.id}`)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>

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
        >
          <h2 className="text-xl font-semibold mb-2">Tambah Penugasan</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm mb-1">
                Kegiatan <span className="text-red-500">*</span>
              </label>
                <Select
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
                <label className="block text-sm mb-1">
                  Pegawai <span className="text-red-500">*</span>
                </label>
                <Select
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
                <label className="block text-sm mb-1">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm mb-1">Minggu</label>
                  <input
                    type="number"
                    value={form.minggu}
                    min="1"
                    max="5"
                    onChange={(e) => setForm({ ...form, minggu: parseInt(e.target.value, 10) })}
                    className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Bulan</label>
                  <select
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
                  <label className="block text-sm mb-1">Tahun</label>
                  <input
                    type="number"
                    value={form.tahun}
                    onChange={(e) => setForm({ ...form, tahun: parseInt(e.target.value, 10) })}
                    className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  Swal.fire({
                    text: "Batalkan penambahan penugasan?",
                    showCancelButton: true,
                    confirmButtonText: "Ya",
                    cancelButtonText: "Tidak",
                  }).then((r) => {
                    if (r.isConfirmed) setShowForm(false);
                  });
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
              >
                Batal
              </button>
              <button onClick={save} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                Simpan
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
