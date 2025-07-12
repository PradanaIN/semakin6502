import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Pencil, Plus, Trash2, Search } from "lucide-react";
import { useAuth } from "../auth/useAuth";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    role: "",
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, _setRoleFilter] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Gagal mengambil pengguna", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get("/roles");
      setRoles(res.data);
    } catch (err) {
      console.error("Gagal mengambil role", err);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm({ nama: "", email: "", password: "", role: "" });
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({ nama: u.nama, email: u.email, password: "", role: u.role });
    setShowForm(true);
  };

  const saveUser = async () => {
    if (
      !form.nama ||
      !form.email ||
      (!editingUser && !form.password) ||
      !form.role
    ) {
      Swal.fire("Lengkapi data", "Semua field wajib diisi", "warning");
      return;
    }
    try {
      if (editingUser) {
        await axios.put(`/users/${editingUser.id}`, form);
      } else {
        await axios.post("/users", form);
      }
      setShowForm(false);
      fetchUsers();
      Swal.fire("Berhasil", "Pengguna disimpan", "success");
    } catch (err) {
      console.error("Gagal menyimpan pengguna", err);
      Swal.fire("Error", "Gagal menyimpan pengguna", "error");
    }
  };

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Hapus pengguna ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/users/${id}`);
      fetchUsers();
      await Swal.fire("Dihapus", "Pengguna berhasil dihapus", "success");
    } catch (err) {
      console.error("Gagal menghapus pengguna", err);
      Swal.fire("Error", "Gagal menghapus pengguna", "error");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.nama.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())) &&
      (roleFilter ? u.role === roleFilter : true)
  );
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (user?.role !== "admin") {
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
              placeholder="Cari pengguna..."
              className="border rounded-md pl-10 pr-3 py-2 bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {/* <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-2 bg-white text-gray-900"
          >
            <option value="">Semua Role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name} className="text-gray-900">
                {r.name}
              </option>
            ))}
          </select> */}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Tambah Pengguna</span>
        </button>
      </div>

      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-center text-sm uppercase">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Nama</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Tim</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="py-4 text-center">Memuat data...</td>
            </tr>
          ) : paginatedUsers.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-4 text-center">
                Data tidak ditemukan
              </td>
            </tr>
          ) : (
            paginatedUsers.map((u) => (
              <tr key={u.id} className="border-t dark:border-gray-700">
                <td className="px-4 py-2 text-center">{u.id}</td>
              <td className="px-4 py-2">{u.nama}</td>
              <td className="px-4 py-2 text">{u.email}</td>
              <td className="px-4 py-2 text-center">
                {u.members?.[0]?.team?.nama_tim || "-"}
              </td>
              <td className="px-4 py-2 capitalize text-center">{u.role}</td>
              <td className="px-4 py-2 space-x-2 text-center">
                <button
                  onClick={() => openEdit(u)}
                  className="p-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  className="p-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  <Trash2 size={16} />
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
            {[5, 10, 15, 20, 25].map((n) => (
              <option
                key={n}
                value={n}
                className="text-gray-900 dark:text-gray-200"
              >
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
          {Array.from(
            { length: Math.ceil(filteredUsers.length / pageSize) || 1 },
            (_, i) => i + 1
          ).map((n) => (
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
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(Math.ceil(filteredUsers.length / pageSize), p + 1)
              )
            }
            disabled={currentPage >= Math.ceil(filteredUsers.length / pageSize)}
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
              {editingUser ? "Edit Pengguna" : "Tambah Pengguna"}
            </h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                >
                  <option value="">Pilih role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
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
                onClick={saveUser}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Simpan
              </button>
              <p className="text-xs text-gray-500 ml-2 self-center">
                * wajib diisi
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
