import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  showSuccess,
  showWarning,
  confirmDelete,
  handleAxiosError,
} from "../../utils/alerts";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Spinner from "../../components/Spinner";
import { useAuth } from "../auth/useAuth";
import Pagination from "../../components/Pagination";
import Modal from "../../components/ui/Modal";
import useModalForm from "../../hooks/useModalForm";
import Table from "../../components/ui/Table";
import tableStyles from "../../components/ui/Table.module.css";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import { ROLES } from "../../utils/roles";
import SearchInput from "../../components/SearchInput";
import SelectDataShow from "../../components/ui/SelectDataShow";

export default function MasterKegiatanPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    showForm,
    form,
    setForm,
    editing,
    openCreate: openCreateForm,
    openEdit: openEditForm,
    closeForm,
  } = useModalForm({ teamId: "", namaKegiatan: "", deskripsi: "" });
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
      handleAxiosError(err, "Gagal mengambil master kegiatan");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, filterTeam, search]);

  const fetchTeams = useCallback(async () => {
    try {
      let res = await axios.get("/teams");
      if (Array.isArray(res.data) && res.data.length === 0) {
        res = await axios.get("/teams/member");
      }
      setTeams(res.data);
    } catch (err) {
      handleAxiosError(err, "Gagal mengambil tim");
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchTeams();
  }, [fetchItems, fetchTeams]);

  const openCreate = () => {
    openCreateForm();
  };

  const openEdit = (item) => {
    openEditForm(item, (i) => ({
      teamId: i.teamId,
      namaKegiatan: i.namaKegiatan,
      deskripsi: i.deskripsi || "",
    }));
  };

  const saveItem = async () => {
    if (!form.teamId || isNaN(form.teamId) || !form.namaKegiatan) {
      showWarning("Lengkapi data", "Tim dan nama kegiatan wajib diisi");
      return;
    }
    try {
      if (editing) {
        await axios.put(`/master-kegiatan/${editing.id}`, form);
      } else {
        await axios.post("/master-kegiatan", form);
      }
      closeForm();
      fetchItems();
      showSuccess("Berhasil", "Kegiatan disimpan");
    } catch (err) {
      handleAxiosError(err, "Gagal menyimpan kegiatan");
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
      handleAxiosError(err, "Gagal menghapus kegiatan");
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
              className="cursor-pointer border border-gray-300 dark:border-gray-600 
      rounded-xl px-2 py-2 bg-white dark:bg-gray-800 
      text-gray-900 dark:text-gray-100 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      hover:border-blue-400 dark:hover:border-blue-400
      shadow-sm transition duration-150 ease-in-out text-center"
            >
              <option value="">Semua</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.namaTim}
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

      <div className="overflow-x-auto md:overflow-x-visible">
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
              <tr key={item.id} className={tableStyles.row}>
                <td className={tableStyles.cell}>
                  {(page - 1) * perPage + idx + 1}
                </td>
                <td className={tableStyles.cell}>
                  {item.team?.namaTim || item.teamId}
                </td>
                <td className={tableStyles.cell}>{item.namaKegiatan}</td>
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
      </div>

      <div className="flex items-center justify-between mt-4">
        <SelectDataShow
          value={perPage}
          onChange={(e) => {
            setPerPage(Number(e.target.value));
            setPage(1);
          }}
          options={[5, 10, 25, 50]}
          className="w-32"
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {showForm && (
        <Modal
          onClose={closeForm}
          titleId="master-kegiatan-form-title"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              id="master-kegiatan-form-title"
              className="text-xl font-semibold"
            >
              {editing ? "Edit Kegiatan" : "Tambah Kegiatan"}
            </h2>
            <p className="text-xs text-red-600 dark:text-red-500">
              * Fardu 'Ain
            </p>
          </div>

          <div className="space-y-2">
            <div>
              <Label htmlFor="teamId" className="dark:text-gray-100">
                Tim <span className="text-red-500">*</span>
              </Label>
              <select
                id="teamId"
                value={form.teamId}
                onChange={(e) =>
                  setForm({ ...form, teamId: parseInt(e.target.value, 10) })
                }
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
              <Label htmlFor="namaKegiatan" className="dark:text-gray-100">
                Nama Kegiatan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="namaKegiatan"
                type="text"
                value={form.namaKegiatan}
                onChange={(e) =>
                  setForm({ ...form, namaKegiatan: e.target.value })
                }
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="deskripsi" className="dark:text-gray-100">
                Deskripsi
              </Label>
              <textarea
                id="deskripsi"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="secondary"
                onClick={closeForm}
              >
                Batal
              </Button>
              <Button onClick={saveItem}>Simpan</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
