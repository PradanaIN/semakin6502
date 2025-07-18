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
import { ROLES } from "../../utils/roles";
import DataTable from "../../components/ui/DataTable";

export default function TeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [form, setForm] = useState({ nama_tim: "" });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      let res = await axios.get("/teams");
      if (Array.isArray(res.data) && res.data.length === 0) {
        res = await axios.get("/teams/member");
      }
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

  const openEdit = useCallback((t) => {
    setEditingTeam(t);
    setForm({ nama_tim: t.nama_tim });
    setShowForm(true);
  }, []);

  const saveTeam = async () => {
    if (!form.nama_tim) {
      showWarning("Lengkapi data", "Nama tim wajib diisi");
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
      showSuccess("Berhasil", "Tim disimpan");
    } catch (err) {
      console.error("Gagal menyimpan tim", err);
      showError("Error", "Gagal menyimpan tim");
    }
  };

  const deleteTeam = useCallback(async (id) => {
    const r = await confirmDelete("Hapus tim ini?");
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/teams/${id}`);
      fetchTeams();
      showSuccess("Dihapus", "Tim berhasil dihapus");
    } catch (err) {
      console.error("Gagal menghapus tim", err);
      showError("Error", "Gagal menghapus tim");
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
        Header: "Nama Tim",
        accessor: "nama_tim",
      },
      {
        Header: "Jumlah Anggota",
        accessor: (row) => row.members?.length || 0,
        id: "anggota",
        disableFilters: true,
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
              onClick={() => deleteTeam(row.original.id)}
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
    [deleteTeam, openEdit]
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
          <span className="hidden sm:inline">Tambah Tim</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-4 text-center">Memuat data...</div>
      ) : (
        <DataTable
          columns={columns}
          data={teams}
        />
      )}

      {showForm && (
        <Modal
          onClose={() => {
            setShowForm(false);
          }}
          titleId="team-form-title"
        >
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
                value={form.nama_tim}
                onChange={(e) => setForm({ ...form, nama_tim: e.target.value })}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
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
            <Button onClick={saveTeam}>Simpan</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
