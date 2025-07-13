import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Plus, Search } from "lucide-react";
import { useAuth } from "../auth/useAuth";

export default function PenugasanPage() {
  const { user } = useAuth();
  const [penugasan, setPenugasan] = useState([]);
  const [teams, setTeams] = useState([]);
  const [kegiatan, setKegiatan] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    kegiatanId: "",
    pegawaiIds: [],
    minggu: 1,
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
  });
  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [kegiatanSearch, setKegiatanSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, tRes, uRes] = await Promise.all([
        axios.get("/penugasan"),
        axios.get("/teams"),
        axios.get("/users"),
      ]);

      let kRes;
      if (user?.role === "admin") {
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
      setTeams(tRes.data);
      setUsers(uRes.data);
      setKegiatan(kRes.data.data || kRes.data);
    } catch (err) {
      console.error("Gagal mengambil data penugasan", err);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setForm({
      kegiatanId: "",
      pegawaiIds: [],
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
      for (const id of form.pegawaiIds) {
        await axios.post("/penugasan", { ...form, pegawaiId: id });
      }
      setShowForm(false);
      fetchData();
      Swal.fire("Berhasil", "Penugasan ditambah", "success");
    } catch (err) {
      console.error("Gagal menyimpan penugasan", err);
      Swal.fire("Error", "Gagal menyimpan penugasan", "error");
    }
  };

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const filtered = penugasan.filter((p) => {
    const k = kegiatan.find((k) => k.id === p.kegiatanId);
    const peg = users.find((u) => u.id === p.pegawaiId);
    const text = `${k?.nama_kegiatan || ""} ${peg?.nama || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  if (!["ketua", "admin"].includes(user?.role)) {
    return <div className="p-6 text-center">Anda tidak memiliki akses ke halaman ini.</div>;
  }

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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari penugasan..."
              className="w-full border rounded-md py-[4px] pl-10 pr-3 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Tambah Penugasan</span>
        </button>
      </div>

      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-center text-sm uppercase">
            <th className="px-4 py-2">Kegiatan</th>
            <th className="px-4 py-2">Pegawai</th>
            <th className="px-4 py-2">Minggu</th>
            <th className="px-4 py-2">Bulan</th>
            <th className="px-4 py-2">Tahun</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="py-4 text-center">
                Memuat data...
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-4 text-center">
                Data tidak ditemukan
              </td>
            </tr>
          ) : (
            filtered.map((p) => {
              const k = kegiatan.find((k) => k.id === p.kegiatanId);
              const peg = users.find((u) => u.id === p.pegawaiId);
              return (
                <tr key={p.id} className="border-t dark:border-gray-700 text-center">
                  <td className="px-4 py-2">{k?.nama_kegiatan || "-"}</td>
                  <td className="px-4 py-2">{peg?.nama || "-"}</td>
                  <td className="px-4 py-2">{p.minggu}</td>
                  <td className="px-4 py-2">{p.bulan}</td>
                  <td className="px-4 py-2">{p.tahun}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-2">Tambah Penugasan</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1">Kegiatan <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={kegiatanSearch}
                  onChange={(e) => setKegiatanSearch(e.target.value)}
                  placeholder="Cari kegiatan..."
                  className="w-full border rounded px-3 py-1 mb-1 bg-white dark:bg-gray-700"
                />
                <select
                  value={form.kegiatanId}
                  onChange={(e) => setForm({ ...form, kegiatanId: parseInt(e.target.value, 10) })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                >
                  <option value="">Pilih kegiatan</option>
                  {kegiatan
                    .filter((k) => k.nama_kegiatan.toLowerCase().includes(kegiatanSearch.toLowerCase()))
                    .map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kegiatan}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Pegawai <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Cari pegawai..."
                  className="w-full border rounded px-3 py-1 mb-1 bg-white dark:bg-gray-700"
                />
                <select
                  multiple
                  value={form.pegawaiIds.map(String)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pegawaiIds: Array.from(e.target.selectedOptions).map((o) => parseInt(o.value, 10)),
                    })
                  }
                  size="5"
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                >
                  {users
                    .filter((u) =>
                      `${u.nama} ${u.members?.[0]?.team?.nama_tim || ""}`
                        .toLowerCase()
                        .includes(userSearch.toLowerCase())
                    )
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {(u.members?.[0]?.team?.nama_tim || "-") + " - " + u.nama}
                      </option>
                    ))}
                </select>
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
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
                Batal
              </button>
              <button onClick={save} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
