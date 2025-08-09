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
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import { ROLES } from "../../utils/roles";
import DataTable from "../../components/ui/DataTable";
import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/Pagination";
import SelectDataShow from "../../components/ui/SelectDataShow";
import TableSkeleton from "../../components/ui/TableSkeleton";

export default function TeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [form, setForm] = useState({ namaTim: "" });
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      let res = await axios.get("/teams");
      if (Array.isArray(res.data) && res.data.length === 0) {
        res = await axios.get("/teams/member");
      }
      setTeams(res.data);
    } catch (err) {
      handleAxiosError(err, "Gagal mengambil tim");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const show = useCallback(() => setShowForm(true), []);
  const close = useCallback(() => setShowForm(false), []);

  const openCreate = useCallback(() => {
    setEditingTeam(null);
    setForm({ namaTim: "" });
    show();
  }, [show]);

  const openEdit = useCallback(
    (t) => {
      setEditingTeam(t);
      setForm({ namaTim: t.namaTim });
      show();
    },
    [show]
  );

  const saveTeam = async () => {
    if (!form.namaTim) {
      showWarning("Lengkapi data", "Nama tim wajib diisi");
      return;
    }
    try {
      if (editingTeam) {
        await axios.put(`/teams/${editingTeam.id}`, form);
      } else {
        await axios.post("/teams", form);
      }
      close();
      fetchTeams();
      showSuccess("Berhasil", "Tim disimpan");
    } catch (err) {
      handleAxiosError(err, "Gagal menyimpan tim");
    }
  };

  const deleteTeam = useCallback(
    async (id) => {
      const r = await confirmDelete("Hapus tim ini?");
      if (!r.isConfirmed) return;
      try {
        await axios.delete(`/teams/${id}`);
        fetchTeams();
        showSuccess("Dihapus", "Tim berhasil dihapus");
      } catch (err) {
        handleAxiosError(err, "Gagal menghapus tim");
      }
    },
    [fetchTeams]
  );

  const filtered = teams.filter((t) =>
    t.namaTim.toLowerCase().includes(query.toLowerCase())
  );
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
        disableFilters: true,
      },
      { Header: "Nama Tim", accessor: "namaTim", disableFilters: true },
      {
        Header: "Jumlah Anggota",
        accessor: (row) => row.members?.length || 0,
        disableFilters: true,
      },
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
              onClick={() => deleteTeam(row.original.id)}
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
    [currentPage, pageSize, openEdit, deleteTeam]
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
        <SearchInput
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Cari tim..."
          ariaLabel="Cari tim"
        />

        <Button onClick={openCreate} className="add-button">
          <Plus size={16} />
          <span className="hidden sm:inline">Tambah Tim</span>
        </Button>
      </div>

      <div className="overflow-x-auto md:overflow-x-visible">
        {loading ? (
          <TableSkeleton cols={columns.length} />
        ) : (
          <DataTable
            columns={columns}
            data={paginated}
            showGlobalFilter={false}
            showPagination={false}
            selectable={false}
            emptyMessage="Belum ada tim"
            emptyAction={
              <Button onClick={openCreate} className="add-button">
                <Plus size={16} />
                <span className="hidden sm:inline">Tambah Tim</span>
              </Button>
            }
          />
        )}
      </div>

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
        <Modal onClose={close} titleId="team-form-title">
          {/* flex container untuk judul + wajib diisi */}
          <div className="flex items-center justify-between mb-3">
            <h2 id="team-form-title" className="text-xl font-semibold">
              {editingTeam ? "Edit Tim" : "Tambah Tim"}
            </h2>
            <p className="text-xs text-red-600 dark:text-red-500">
              * Fardu 'Ain
            </p>
          </div>

          <div className="space-y-2">
            <div>
              <Label htmlFor="namaTim" className="dark:text-gray-100">
                Nama Tim <span className="text-red-500">*</span>
              </Label>
              <Input
                id="namaTim"
                type="text"
                value={form.namaTim}
                onChange={(e) => setForm({ ...form, namaTim: e.target.value })}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="secondary"
              onClick={async () => {
                const r = await confirmCancel("Batalkan perubahan?");
                if (r.isConfirmed) close();
              }}
            >
              Batal
            </Button>
            <Button onClick={saveTeam}>Simpan</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
