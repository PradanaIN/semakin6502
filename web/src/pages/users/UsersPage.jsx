import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  showSuccess,
  showError,
  showWarning,
  confirmDelete,
  confirmCancel,
} from "../../utils/alerts";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import Pagination from "../../components/Pagination";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import tableStyles from "../../components/ui/Table.module.css";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import SearchInput from "../../components/SearchInput";
import Spinner from "../../components/Spinner";
import { ROLES } from "../../utils/roles";

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
  const [roleFilter, setRoleFilter] = useState("");

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

  const openEdit = useCallback((u) => {
    setEditingUser(u);
    setForm({ nama: u.nama, email: u.email, password: "", role: u.role });
    setShowForm(true);
  }, []);

  const saveUser = async () => {
    if (
      !form.nama ||
      !form.email ||
      (!editingUser && !form.password) ||
      !form.role
    ) {
      showWarning("Lengkapi data", "Semua field wajib diisi");
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
      showSuccess("Berhasil", "Pengguna disimpan");
    } catch (err) {
      console.error("Gagal menyimpan pengguna", err);
      showError("Error", "Gagal menyimpan pengguna");
    }
  };

  const deleteUser = useCallback(async (id) => {
    const result = await confirmDelete("Hapus pengguna ini?");
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/users/${id}`);
      fetchUsers();
      showSuccess("Dihapus", "Pengguna berhasil dihapus");
    } catch (err) {
      console.error("Gagal menghapus pengguna", err);
      showError("Error", "Gagal menghapus pengguna");
    }
  }, []);

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
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;

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
            placeholder="Cari pengguna..."
            ariaLabel="Cari pengguna"
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-2 py-[4px] bg-white dark:bg-gray-700 dark:text-gray-200 text-center"
          >
            <option value="" className="text-gray-900 dark:text-gray-200">
              Semua Role
            </option>
            {roles.map((r) => (
              <option
                key={r.id}
                value={r.name}
                className="text-gray-900 dark:text-gray-200"
              >
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={openCreate} className="add-button">
          <Plus size={16} />
          <span className="hidden sm:inline">Tambah Pengguna</span>
        </Button>
      </div>

      <Table>
        <thead>
          <tr className={tableStyles.headerRow}>
            <th className={tableStyles.cell}>No</th>
            <th className={tableStyles.cell}>Nama</th>
            <th className={tableStyles.cell}>Email</th>
            <th className={tableStyles.cell}>Tim</th>
            <th className={tableStyles.cell}>Role</th>
            <th className={tableStyles.cell}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="py-4 text-center">
                <Spinner className="h-6 w-6 mx-auto" />
              </td>
            </tr>
          ) : paginatedUsers.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-4 text-center">
                Data tidak ditemukan
              </td>
            </tr>
          ) : (
            paginatedUsers.map((u, idx) => (
              <tr
                key={u.id}
                className={`${tableStyles.row} border-t dark:border-gray-700`}
              >
                <td className={`${tableStyles.cell} text-center`}>
                  {(currentPage - 1) * pageSize + idx + 1}
                </td>
                <td className={`${tableStyles.cell} text-center`}>{u.nama}</td>
                <td className={`${tableStyles.cell} text-center`}>{u.email}</td>
                <td className={`${tableStyles.cell} text-center`}>
                  {u.members?.[0]?.team?.nama_tim || "-"}
                </td>
                <td className={`${tableStyles.cell} capitalize text-center`}>
                  {u.role}
                </td>
                <td className={`${tableStyles.cell} space-x-2 text-center`}>
                  <Button
                    onClick={() => openEdit(u)}
                    variant="warning"
                    icon
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    onClick={() => deleteUser(u.id)}
                    variant="danger"
                    icon
                    aria-label="Hapus"
                  >
                    <Trash2 size={16} />
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
          titleId="user-form-title"
        >
          <h2 id="user-form-title" className="text-xl font-semibold mb-2">
            {editingUser ? "Edit Pengguna" : "Tambah Pengguna"}
          </h2>
          <div className="space-y-2">
            <div>
              <Label htmlFor="nama">
                Nama <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama"
                type="text"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <select
                id="role"
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
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  const r = await confirmCancel("Batalkan perubahan?");
                  if (r.isConfirmed) setShowForm(false);
                }}
              >
                Batal
              </Button>
              <Button onClick={saveUser}>Simpan</Button>
              <p className="text-xs text-gray-500 ml-2 self-center dark:text-gray-400">
                * wajib diisi
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
