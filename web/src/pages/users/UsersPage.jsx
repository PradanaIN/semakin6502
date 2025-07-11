import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../auth/useAuth";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ nama: "", email: "", password: "", role: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Gagal mengambil pengguna", err);
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
    try {
      if (editingUser) {
        await axios.put(`/users/${editingUser.id}`, form);
      } else {
        await axios.post("/users", form);
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      console.error("Gagal menyimpan pengguna", err);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Hapus pengguna ini?")) return;
    try {
      await axios.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Gagal menghapus pengguna", err);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-6 text-center">Anda tidak memiliki akses ke halaman ini.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kelola Pengguna</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Tambah Pengguna
        </button>
      </div>

      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-left text-sm uppercase">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Nama</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t dark:border-gray-700">
              <td className="px-4 py-2">{u.id}</td>
              <td className="px-4 py-2">{u.nama}</td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2 capitalize">{u.role}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => openEdit(u)}
                  className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-2">
              {editingUser ? "Edit Pengguna" : "Tambah Pengguna"}
            </h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1">Nama</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Role</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
