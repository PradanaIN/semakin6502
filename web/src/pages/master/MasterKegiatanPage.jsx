import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  showSuccess,
  showError,
  showWarning,
  confirmDelete,
} from "../../utils/alerts";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Spinner from "../../components/Spinner";
import { useAuth } from "../auth/useAuth";
import Pagination from "../../components/Pagination";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import tableStyles from "../../components/ui/Table.module.css";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
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
      showWarning("Lengkapi data", "Tim dan nama kegiatan wajib diisi");
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
      showSuccess("Berhasil", "Kegiatan disimpan");
    } catch (err) {
      console.error("Gagal menyimpan kegiatan", err);
      showError("Error", "Gagal menyimpan kegiatan");
    }
  };

  const deleteItem = async (item) => {
    const r = await confirmDelete("Hapus kegiatan ini?");
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/master-kegiatan/${item.id}`);
      fetchItems();
      showSuccess("Dihapus", "Kegiatan berhasil dihapus");
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
          <div className="flex-1 max-w-sm">
            <SearchInput
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Cari kegiatan..."
              ariaLabel="Cari kegiatan"
            />
          </div>

          <div>
            <select
              value={filterTeam}
              onChange={(e) => {
                setPage(1);
                setFilterTeam(e.target.value);
              }}
              className="border rounded px-2 py-[4px] bg-white dark:bg-gray-700 dark:text-gray-200 text-center"
            >
              <option value="">Semua</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama_tim}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Button onClick={openCreate} className="add-button">
            <Plus size={16} />
            <span className="hidden sm:inline">Tambah Kegiatan</span>
          </Button>
        </div>
      </div>

      <Table>
        <thead>
          <tr className={tableStyles.headerRow}>
            <th className={tableStyles.cell}>No</th>
            <th className={tableStyles.cell}>Tim</th>
            <th className={tableStyles.cell}>Nama Kegiatan</th>
            <th className={tableStyles.cell}>Deskripsi</th>
            <th className={tableStyles.cell}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="py-4 text-center">
                <Spinner className="h-6 w-6 mx-auto" />
              </td>
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
                className={`${tableStyles.row} border-t dark:border-gray-700 text-center`}
              >
                <td className={tableStyles.cell}>
                  {(page - 1) * perPage + idx + 1}
                </td>
                <td className={tableStyles.cell}>
                  {item.team?.nama_tim || item.teamId}
                </td>
                <td className={tableStyles.cell}>{item.nama_kegiatan}</td>
                <th className={tableStyles.cell}>
                  {!item.deskripsi ? "-" : item.deskripsi}
                </th>
                <td className={`${tableStyles.cell} space-x-2`}>
                  <Button
                    onClick={() => openEdit(item)}
                    variant="warning"
                    icon
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    onClick={() => deleteItem(item)}
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
            value={perPage}
            onChange={(e) => {
              setPage(1);
              setPerPage(parseInt(e.target.value, 10));
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
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {showForm && (
        <Modal
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          titleId="master-kegiatan-form-title"
        >
          <h2
            id="master-kegiatan-form-title"
            className="text-xl font-semibold mb-2"
          >
            {editing ? "Edit Kegiatan" : "Tambah Kegiatan"}
          </h2>
          <div className="space-y-2">
            <div>
              <Label htmlFor="teamId">
                Tim <span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="namaKegiatan">
                Nama Kegiatan <span className="text-red-500">*</span>
              </Label>
              <Input
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
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <textarea
                id="deskripsi"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                className="form-input"
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
