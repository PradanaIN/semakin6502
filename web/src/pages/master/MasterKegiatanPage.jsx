import { useEffect, useState, useCallback } from "react";
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

export default function MasterKegiatanPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    teamId: "",
    nama_kegiatan: "",
    deskripsi: "",
  });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filterTeam, setFilterTeam] = useState("");
  const [search, setSearch] = useState("");
  const totalPages = lastPage || 1;
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/master-kegiatan", {
        params: {
          page,
          limit: perPage,
          team: filterTeam || undefined,
          search: search || undefined,
        },
      });
      setItems(res.data.data);
      setLastPage(res.data.lastPage);
    } catch (err) {
      console.error("Gagal mengambil master kegiatan", err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, filterTeam, search]);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await axios.get("/teams");
      setTeams(res.data);
    } catch (err) {
      console.error("Gagal mengambil tim", err);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchTeams();
  }, [fetchItems, fetchTeams]);

  const openCreate = () => {
    setEditing(null);
    setForm({ teamId: "", nama_kegiatan: "", deskripsi: "" });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      teamId: item.teamId,
      nama_kegiatan: item.nama_kegiatan,
      deskripsi: item.deskripsi || "",
    });
    setShowForm(true);
  };

  const saveItem = async () => {
    if (!form.teamId || isNaN(form.teamId) || !form.nama_kegiatan) {
      Swal.fire(
        "Lengkapi data",
        "Tim dan nama kegiatan wajib diisi",
        "warning"
      );
      return;
    }
    try {
      if (editing) {
        await axios.put(`/master-kegiatan/${editing.id}`, form);
      } else {
        await axios.post("/master-kegiatan", form);
      }
      setShowForm(false);
      setEditing(null);
      fetchItems();
      Swal.fire("Berhasil", "Kegiatan disimpan", "success");
    } catch (err) {
      console.error("Gagal menyimpan kegiatan", err);
      Swal.fire("Error", "Gagal menyimpan kegiatan", "error");
    }
  };

  const deleteItem = async (item) => {
    const r = await Swal.fire({
      title: "Hapus kegiatan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/master-kegiatan/${item.id}`);
      fetchItems();
      Swal.fire("Dihapus", "Kegiatan berhasil dihapus", "success");
    } catch (err) {
      console.error("Gagal menghapus kegiatan", err);
    }
  };

  if (![ROLES.KETUA, ROLES.ADMIN].includes(user?.role)) {
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
          <div>
            <select
              value={filterTeam}
              onChange={(e) => {
                setPage(1);
                setFilterTeam(e.target.value);
              }}
              className="border px-2 py-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            >
              <option value="">Semua</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama_tim}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 max-w-sm">
            <SearchInput
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Cari kegiatan..."
            />
          </div>

        </div>

        <div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Tambah Kegiatan</span>
          </button>
        </div>

      </div>

      <Table>
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-center text-sm uppercase">
            <th className="px-4 py-2">No</th>
            <th className="px-4 py-2">Tim</th>
            <th className="px-4 py-2">Nama Kegiatan</th>
            <th className="px-4 py-2">Deskripsi</th>
            <th className="px-4 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="py-4 text-center">Memuat data...</td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-4 text-center">
                Data tidak ditemukan
              </td>
            </tr>
          ) : (
          items.map((item, idx) => (
            <tr
              key={item.id}
              className="border-t dark:border-gray-700 text-center"
            >
              <td className="px-4 py-2">{(page - 1) * perPage + idx + 1}</td>
              <td className="px-4 py-2">
                {item.team?.nama_tim || item.teamId}
              </td>
              <td className="px-4 py-2">{item.nama_kegiatan}</td>
              <th className="px-4 py-2">
                {!item.deskripsi ? "-" : item.deskripsi}
              </th>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => openEdit(item)}
                  className="p-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                  aria-label="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteItem(item)}
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
            value={perPage}
            onChange={(e) => {
              setPage(1);
              setPerPage(parseInt(e.target.value, 10));
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
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showForm && (
        <Modal
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        >
          <h2 className="text-xl font-semibold mb-2">
            {editing ? "Edit Kegiatan" : "Tambah Kegiatan"}
          </h2>
          <div className="space-y-2">
            <div>
              <label htmlFor="teamId" className="block text-sm mb-1">
                Tim <span className="text-red-500">*</span>
              </label>
              <select
                id="teamId"
                value={form.teamId}
                onChange={(e) =>
                  setForm({ ...form, teamId: parseInt(e.target.value, 10) })
                }
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              >
                  <option value="">Pilih tim</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama_tim}
                    </option>
                  ))}
                </select>
              </div>
            <div>
              <label htmlFor="namaKegiatan" className="block text-sm mb-1">
                Nama Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                id="namaKegiatan"
                type="text"
                value={form.nama_kegiatan}
                onChange={(e) =>
                  setForm({ ...form, nama_kegiatan: e.target.value })
                }
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              />
              </div>
            <div>
              <label htmlFor="deskripsi" className="block text-sm mb-1">Deskripsi</label>
              <textarea
                id="deskripsi"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              />
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
              <Button onClick={saveItem}>Simpan</Button>
              <p className="text-xs text-gray-500 ml-2 self-center">
                * wajib diisi
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
