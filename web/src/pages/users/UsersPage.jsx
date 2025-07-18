import { useEffect, useState, useCallback, useMemo } from "react";
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
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import Spinner from "../../components/Spinner";
import { ROLES } from "../../utils/roles";
import DataTable, { SelectColumnFilter } from "../../components/ui/DataTable";

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

  const columns = useMemo(
    () => [
      {
        Header: "No",
        id: "row",
        Cell: ({ row }) => row.index + 1,
        disableFilters: true,
      },
      {
        Header: "Nama",
        accessor: "nama",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Tim",
        accessor: (row) => row.members?.[0]?.team?.nama_tim || "-",
        id: "team",
        disableFilters: true,
      },
      {
        Header: "Role",
        accessor: "role",
        Filter: SelectColumnFilter,
        filter: "includes",
      },
      {
        Header: "Aksi",
        id: "aksi",
        disableFilters: true,
        Cell: ({ row }) => (
          <div className="space-x-2">
            <Button
              onClick={() => openEdit(row.original)}
              variant="warning"
              icon
              aria-label="Edit"
            >
              <Pencil size={16} />
            </Button>
            <Button
              onClick={() => deleteUser(row.original.id)}
              variant="danger"
              icon
              aria-label="Hapus"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [deleteUser, openEdit]
  );


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
        <Button onClick={openCreate} className="add-button">
          <Plus size={16} />
          <span className="hidden sm:inline">Tambah Pengguna</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-4 text-center">
          <Spinner className="h-6 w-6 mx-auto" />
        </div>
      ) : (
        <DataTable columns={columns} data={users} />
      )}

      {showForm && (
        <Modal
          onClose={() => {
            setShowForm(false);
          }}
          titleId="user-form-title"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 id="user-form-title" className="text-xl font-semibold">
              {editingUser ? "Edit Pengguna" : "Tambah Pengguna"}
            </h2>
            <p className="text-xs text-red-600 dark:text-red-500">
              * Fardu 'Ain
            </p>
          </div>

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
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100"
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
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100"
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
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100"
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
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100"
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
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
