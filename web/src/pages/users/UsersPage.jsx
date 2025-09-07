import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  showSuccess,
  showWarning,
  confirmDelete,
  confirmCancel,
  handleAxiosError,
} from "../../utils/alerts";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import Modal from "../../components/ui/Modal";
import useModalForm from "../../hooks/useModalForm";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import { ROLES } from "../../utils/roles";
import DataTable from "../../components/ui/DataTable";
import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/Pagination";
import SelectDataShow from "../../components/ui/SelectDataShow";
import TableSkeleton from "../../components/ui/TableSkeleton";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    showForm,
    form,
    setForm,
    editing: editingUser,
    openCreate: openCreateForm,
    openEdit: openEditForm,
    closeForm,
  } = useModalForm({ nama: "", email: "", phone: "", password: "", role: "", teamId: "" });
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/users");
      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        console.warn("Unexpected users response", res.data);
        setUsers([]);
      }
    } catch (err) {
      handleAxiosError(err, "Gagal mengambil pengguna");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get("/roles");
      if (Array.isArray(res.data)) {
        setRoles(res.data);
      } else {
        console.warn("Unexpected roles response", res.data);
        setRoles([]);
      }
    } catch (err) {
      handleAxiosError(err, "Gagal mengambil role");
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get("/teams");
      if (Array.isArray(res.data)) {
        setTeams(res.data);
      } else {
        console.warn("Unexpected teams response", res.data);
        setTeams([]);
      }
    } catch (err) {
      handleAxiosError(err, "Gagal mengambil tim");
    }
  };
  const openEdit = useCallback(
    (u) => {
      openEditForm(u, (v) => ({ nama: v.nama, email: v.email, phone: v.phone || "", password: "", role: v.role, teamId: v.members?.[0]?.teamId || "" }));
    },
    [openEditForm]
  );

  const saveUser = async () => {
    if (
      !form.nama ||
      !form.email ||
      !form.phone ||
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
      closeForm();
      fetchUsers();
      showSuccess("Berhasil", "Pengguna disimpan");
    } catch (err) {
      handleAxiosError(err, "Gagal menyimpan pengguna");
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
      handleAxiosError(err, "Gagal menghapus pengguna");
    }
  }, []);

  const filtered = users.filter((u) => {
    const txt = `${u.nama} ${u.email}`.toLowerCase();
    const matchQuery = txt.includes(query.toLowerCase());
    const matchRole = roleFilter ? u.role === roleFilter : true;
    return matchQuery && matchRole;
  });

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  const columns = useMemo(
    () => [
      {
        Header: "No",
        accessor: (_row, i) => (currentPage - 1) * pageSize + i + 1,
      },
      { Header: "Nama", accessor: "nama" },
      { Header: "Email", accessor: "email" },
      { Header: "WhatsApp", accessor: "phone" },
      {
        Header: "Tim",
        accessor: (row) => row.members?.[0]?.team?.namaTim || "-",

      },
      { Header: "Role", accessor: "role" },
      {
        Header: "Aksi",
        accessor: "id",
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
        disableFilters: true,
      },
    ],
    [currentPage, pageSize, openEdit, deleteUser]
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
      <div className="flex flex-wrap justify-between items-end gap-2">
        <div className="flex items-end gap-2 flex-wrap">
          <SearchInput
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
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
            className="cursor-pointer border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">Semua role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={openCreateForm} className="add-button">
          <Plus size={16} />
          <span className="hidden sm:inline">Tambah Pengguna</span>
        </Button>
      </div>

      {loading ? (
        <TableSkeleton cols={columns.length} />
      ) : (
        <DataTable
          columns={columns}
          data={paginated}
          showGlobalFilter={false}
          showPagination={false}
          selectable={false}
        />
      )}

      <div className="flex items-center justify-between mt-4">
        <SelectDataShow
          pageSize={pageSize}
          setPageSize={setPageSize}
          setCurrentPage={setCurrentPage}
          options={[5, 10, 25, 50]}
          className="w-32"
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {showForm && (
        <Modal
          onClose={closeForm}
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
              <Label htmlFor="phone">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="teamId">Tim</Label>
              <select
                id="teamId"
                value={form.teamId}
                onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">Pilih tim</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.namaTim}
                  </option>
                ))}
              </select>
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
                  if (r.isConfirmed) closeForm();
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
