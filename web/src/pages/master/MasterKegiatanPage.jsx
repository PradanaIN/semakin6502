import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../auth/useAuth";

export default function MasterKegiatanPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({ teamId: "", nama_kegiatan: "", deskripsi: "" });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filterTeam, setFilterTeam] = useState("");
  const [search, setSearch] = useState("");
  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get("/master-kegiatan", {
        params: {
          page,
          team: filterTeam || undefined,
          search: search || undefined,
        },
      });
      setItems(res.data.data);
      setLastPage(res.data.lastPage);
    } catch (err) {
      console.error("Gagal mengambil master kegiatan", err);
    }
  }, [page, filterTeam, search]);

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
    setForm({ teamId: item.teamId, nama_kegiatan: item.nama_kegiatan, deskripsi: item.deskripsi || "" });
    setShowForm(true);
  };

  const saveItem = async () => {
    if (!form.teamId || isNaN(form.teamId) || !form.nama_kegiatan) {
      Swal.fire("Lengkapi data", "Tim dan nama kegiatan wajib diisi", "warning");
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

  if (!["ketua", "admin"].includes(user?.role)) {
    return (
      <div className="p-6 text-center">Anda tidak memiliki akses ke halaman ini.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Master Kegiatan</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Tambah Kegiatan
        </button>
      </div>

      <div className="flex items-end space-x-2">
        <div>
          <label className="text-sm block">Filter Tim</label>
          <select
            value={filterTeam}
            onChange={(e) => {
              setPage(1);
              setFilterTeam(e.target.value);
            }}
            className="border px-2 py-1 rounded"
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
          <label className="text-sm block">Cari</label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full border rounded px-3 py-1"
            placeholder="Nama kegiatan"
          />
        </div>
      </div>

      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-left text-sm uppercase">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Tim</th>
            <th className="px-4 py-2">Nama Kegiatan</th>
            <th className="px-4 py-2">Deskripsi</th>
            <th className="px-4 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t dark:border-gray-700">
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">{item.team?.nama_tim || item.teamId}</td>
              <td className="px-4 py-2">{item.nama_kegiatan}</td>
              <td className="px-4 py-2">{item.deskripsi}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => openEdit(item)}
                  className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteItem(item)}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end space-x-2 mt-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-2 py-1">Page {page} / {lastPage}</span>
        <button
          onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
          disabled={page >= lastPage}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-2">
              {editing ? "Edit Kegiatan" : "Tambah Kegiatan"}
            </h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1">Tim</label>
                <select
                  value={form.teamId}
                  onChange={(e) => setForm({ ...form, teamId: parseInt(e.target.value, 10) })}
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
                <label className="block text-sm mb-1">Nama Kegiatan</label>
                <input
                  type="text"
                  value={form.nama_kegiatan}
                  onChange={(e) => setForm({ ...form, nama_kegiatan: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
              >
                Batal
              </button>
              <button
                onClick={saveItem}
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
