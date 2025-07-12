import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../auth/useAuth";

export default function TeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [form, setForm] = useState({ nama_tim: "" });
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await axios.get("/teams");
      setTeams(res.data);
    } catch (err) {
      console.error("Gagal mengambil tim", err);
    }
  };

  const openCreate = () => {
    setEditingTeam(null);
    setForm({ nama_tim: "" });
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditingTeam(t);
    setForm({ nama_tim: t.nama_tim });
    setShowForm(true);
  };

  const saveTeam = async () => {
    if (!form.nama_tim) {
      Swal.fire("Lengkapi data", "Nama tim wajib diisi", "warning");
      return;
    }
    try {
      if (editingTeam) {
        await axios.put(`/teams/${editingTeam.id}`, form);
      } else {
        await axios.post("/teams", form);
      }
      setShowForm(false);
      fetchTeams();
      Swal.fire("Berhasil", "Tim disimpan", "success");
    } catch (err) {
      console.error("Gagal menyimpan tim", err);
      Swal.fire("Error", "Gagal menyimpan tim", "error");
    }
  };

  const deleteTeam = async (id) => {
    const r = await Swal.fire({
      title: "Hapus tim ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/teams/${id}`);
      fetchTeams();
      Swal.fire("Dihapus", "Tim berhasil dihapus", "success");
    } catch (err) {
      console.error("Gagal menghapus tim", err);
      Swal.fire("Error", "Gagal menghapus tim", "error");
    }
  };

  const filtered = teams.filter((t) =>
    t.nama_tim.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (user?.role !== "admin") {
    return (
      <div className="p-6 text-center">Anda tidak memiliki akses ke halaman ini.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold mr-2">Kelola Tim</h1>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari tim..."
            className="border rounded px-3 py-2 bg-white text-gray-900"
          />
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Tambah Tim
        </button>
      </div>

      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-left text-sm uppercase">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Nama Tim</th>
            <th className="px-4 py-2">Jumlah Anggota</th>
            <th className="px-4 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((t) => (
            <tr key={t.id} className="border-t dark:border-gray-700">
              <td className="px-4 py-2">{t.id}</td>
              <td className="px-4 py-2">{t.nama_tim}</td>
              <td className="px-4 py-2">{t.members?.length || 0}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => openEdit(t)}
                  className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTeam(t.id)}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
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
            className="border rounded px-3 py-2 bg-white text-gray-900"
          >
            {[5, 10, 15, 20, 25].map((n) => (
              <option key={n} value={n} className="text-gray-900">
                {n} / halaman
              </option>
            ))}
          </select>
        </div>
        <div className="space-x-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-full disabled:opacity-50 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Prev
          </button>
          {Array.from({ length: Math.ceil(filtered.length / pageSize) || 1 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setCurrentPage(n)}
              className={`px-3 py-1 rounded-full ${
                currentPage === n
                  ? "bg-blue-600 text-white"
                  : "border bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filtered.length / pageSize), p + 1))}
            disabled={currentPage >= Math.ceil(filtered.length / pageSize)}
            className="px-3 py-1 border rounded-full disabled:opacity-50 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-2">
              {editingTeam ? "Edit Tim" : "Tambah Tim"}
            </h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1">Nama Tim</label>
                <input
                  type="text"
                  value={form.nama_tim}
                  onChange={(e) => setForm({ ...form, nama_tim: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={async () => {
                  const r = await Swal.fire({
                    title: "Batalkan perubahan?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Ya",
                  });
                  if (r.isConfirmed) setShowForm(false);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
              >
                Batal
              </button>
              <button
                onClick={saveTeam}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
