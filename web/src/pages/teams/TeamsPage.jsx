import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import Pagination from "../../components/Pagination";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import { ROLES } from "../../utils/roles";
import SearchInput from "../../components/SearchInput";

export default function TeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [form, setForm] = useState({ nama_tim: "" });
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/teams");
      setTeams(res.data);
    } catch (err) {
      console.error("Gagal mengambil tim", err);
    } finally {
      setLoading(false);
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
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  if (user?.role !== ROLES.ADMIN) {
    return (
      <div className="p-6 text-center">
        Anda tidak memiliki akses ke halaman ini.
      </div>
    );
  }

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
            placeholder="Cari tim..."
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Tambah Tim</span>
        </button>
      </div>

      <Table>
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-center text-sm uppercase">
            <th className="px-4 py-2">No</th>
            <th className="px-4 py-2">Nama Tim</th>
            <th className="px-4 py-2">Jumlah Anggota</th>
            <th className="px-4 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="py-4 text-center">
                Memuat data...
              </td>
            </tr>
          ) : paginated.length === 0 ? (
            <tr>
              <td colSpan="4" className="py-4 text-center">
                Data tidak ditemukan
              </td>
            </tr>
          ) : (
          paginated.map((t, idx) => (
            <tr
              key={t.id}
              className="border-t dark:border-gray-700 text-center"
            >
              <td className="px-4 py-2">{(currentPage - 1) * pageSize + idx + 1}</td>
              <td className="px-4 py-2">{t.nama_tim}</td>
              <td className="px-4 py-2">{t.members?.length || 0}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => openEdit(t)}
                  className="p-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                  aria-label="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteTeam(t.id)}
                  className="p-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                  aria-label="Hapus"
                >
                  <Trash2 size={16} />
                </button>
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
              <option
                key={n}
                value={n}
                className="text-gray-900 dark:text-gray-200"
              >
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

      {showForm && (
        <Modal
          onClose={() => {
            setShowForm(false);
          }}
        >
          <h2 className="text-xl font-semibold mb-2">
            {editingTeam ? "Edit Tim" : "Tambah Tim"}
          </h2>
          <div className="space-y-2">
            <div>
              <label htmlFor="namaTim" className="block text-sm mb-1">Nama Tim</label>
              <input
                id="namaTim"
                type="text"
                value={form.nama_tim}
                onChange={(e) =>
                  setForm({ ...form, nama_tim: e.target.value })
                }
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              />
            </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  const r = await Swal.fire({
                    title: "Batalkan perubahan?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Ya",
                  });
                  if (r.isConfirmed) setShowForm(false);
                }}
              >
                Batal
              </Button>
              <Button onClick={saveTeam}>
                Simpan
              </Button>
            </div>
          </Modal>
      )}
    </div>
  );
}
