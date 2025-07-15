import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { showSuccess, showError, confirmDelete } from "../../utils/alerts";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Table from "../../components/ui/Table";
import tableStyles from "../../components/ui/Table.module.css";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import MonthYearPicker from "../../components/ui/MonthYearPicker";
import Select from "react-select";
import { STATUS } from "../../utils/status";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/Pagination";
import SelectDataShow from "../../components/ui/SelectDataShow";

export default function KegiatanTambahanPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [teams, setTeams] = useState([]);
  const [kegiatan, setKegiatan] = useState([]);
  const [form, setForm] = useState({
    teamId: "",
    kegiatanId: "",
    tanggal: new Date().toISOString().slice(0, 10),
    status: STATUS.BELUM,
    deskripsi: "",
  });
  const [search, setSearch] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear());
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, kRes, teamRes] = await Promise.all([
        axios.get("/kegiatan-tambahan"),
        axios.get("/master-kegiatan?limit=1000"),
        axios.get("/teams"),
      ]);
      setItems(tRes.data);
      setKegiatan(kRes.data.data || kRes.data);
      setTeams(teamRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      teamId: "",
      kegiatanId: "",
      tanggal: new Date().toISOString().slice(0, 10),
      status: STATUS.BELUM,
      deskripsi: "",
    });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      teamId: item.teamId,
      kegiatanId: item.kegiatanId,
      tanggal: item.tanggal.slice(0, 10),
      status: item.status,
      deskripsi: item.deskripsi || "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.teamId || !form.kegiatanId || !form.tanggal) return;
    try {
      const payload = { ...form };
      delete payload.teamId;
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });
      if (editing) {
        await axios.put(`/kegiatan-tambahan/${editing.id}`, payload);
      } else {
        await axios.post("/kegiatan-tambahan", payload);
      }
      setShowForm(false);
      setEditing(null);
      fetchData();
      showSuccess("Berhasil", "Data disimpan");
    } catch (err) {
      console.error(err);
      showError("Error", "Gagal menyimpan");
    }
  };

  const remove = async (item) => {
    const r = await confirmDelete("Hapus kegiatan ini?");
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/kegiatan-tambahan/${item.id}`);
      fetchData();
      showSuccess("Dihapus", "Kegiatan dihapus");
    } catch (err) {
      console.error(err);
      showError("Error", "Gagal menghapus");
    }
  };

  const openDetail = (id) => {
    navigate(`/kegiatan-tambahan/${id}`);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const text = `${item.nama} ${
        item.kegiatan?.team?.nama_tim || ""
      }`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const date = new Date(item.tanggal);
      const bulan = date.getMonth() + 1;
      const tahun = date.getFullYear();
      const matchBulan = filterBulan
        ? bulan === parseInt(filterBulan, 10)
        : true;
      const matchTahun = filterTahun
        ? tahun === parseInt(filterTahun, 10)
        : true;
      return matchesSearch && matchBulan && matchTahun;
    });
  }, [items, search, filterBulan, filterTahun]);

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kegiatan..."
            ariaLabel="Cari kegiatan"
          />
          <MonthYearPicker
            month={filterBulan}
            year={filterTahun}
            onMonthChange={setFilterBulan}
            onYearChange={setFilterTahun}
          />
        </div>

        <div className="flex justify-between items-center">
          <Button onClick={openCreate} className="add-button">
            <Plus size={16} />
            <span className="hidden sm:inline">Tugas Tambahan</span>
          </Button>
        </div>
      </div>

      <Table>
        <thead>
          <tr className={tableStyles.headerRow}>
            <th className={tableStyles.cell}>No</th>
            <th className={tableStyles.cell}>Kegiatan</th>
            <th className={tableStyles.cell}>Tim</th>
            <th className={tableStyles.cell}>Tanggal</th>
            <th className={tableStyles.cell}>Deskripsi</th>
            <th className={tableStyles.cell}>Status</th>
            <th className={tableStyles.cell}>Bukti Dukung</th>
            <th className={tableStyles.cell}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8" className="py-4 text-center">
                Memuat data...
              </td>
            </tr>
          ) : paginatedItems.length === 0 ? (
            <tr>
              <td colSpan="8" className="py-4 text-center">
                Data tidak ditemukan
              </td>
            </tr>
          ) : (
            paginatedItems.map((item, idx) => (
              <tr
                key={item.id}
                className={`${tableStyles.row} border-t dark:border-gray-700 text-center`}
              >
                <td className={tableStyles.cell}>
                  {(currentPage - 1) * pageSize + idx + 1}
                </td>
                <td className={tableStyles.cell}>{item.nama}</td>
                <td className={tableStyles.cell}>
                  {item.kegiatan.team?.nama_tim || "-"}
                </td>
                <td className={tableStyles.cell}>
                  {item.tanggal.slice(0, 10)}
                </td>
                <td className={tableStyles.cell}>{item.deskripsi || "-"}</td>
                <td className={tableStyles.cell}>
                  <StatusBadge status={item.status} />
                </td>
                <td className={tableStyles.cell}>
                  {item.bukti_dukung ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                </td>
                <td className={`${tableStyles.cell} space-x-2`}>
                  <Button
                    onClick={() => openDetail(item.id)}
                    icon
                    aria-label="Detail"
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    onClick={() => openEdit(item)}
                    variant="warning"
                    icon
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    onClick={() => remove(item)}
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
        <SelectDataShow
          value={pageSize}
          onChange={setPageSize}
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
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          titleId="kegiatan-tambahan-modal-title"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              id="kegiatan-tambahan-modal-title"
              className="text-xl font-semibold"
            >
              {editing ? "Edit Kegiatan" : "Tambah Kegiatan"}
            </h2>
            <p className="text-xs text-red-600 dark:text-red-500">
              * Fardu 'Ain
            </p>
          </div>

          <div className="space-y-2">
            {/* Pilih Tim */}
            <div>
              <Label htmlFor="teamId" className="dark:text-gray-100">
                Tim <span className="text-red-500">*</span>
              </Label>
              <select
                id="teamId"
                value={form.teamId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    teamId: parseInt(e.target.value, 10),
                    kegiatanId: "", // reset kegiatan jika tim berubah
                  })
                }
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">Tim</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama_tim}
                  </option>
                ))}
              </select>
            </div>

            {/* Pilih Kegiatan */}
            <div>
              <Label htmlFor="kegiatan" className="dark:text-gray-100">
                Kegiatan <span className="text-red-500">*</span>
              </Label>
              <Select
                inputId="kegiatan"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "#ffffff",
                    borderColor: "#d1d5db",
                    borderRadius: "0.5rem",
                    padding: "2px 6px",
                    color: "#1f2937",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "#1f2937",
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
                isDisabled={!form.teamId}
                options={
                  form.teamId
                    ? kegiatan
                        .filter((k) => k.teamId === form.teamId)
                        .map((k) => ({
                          value: k.id,
                          label: k.nama_kegiatan,
                        }))
                    : []
                }
                value={
                  form.kegiatanId
                    ? {
                        value: form.kegiatanId,
                        label: kegiatan.find((k) => k.id === form.kegiatanId)
                          ?.nama_kegiatan,
                      }
                    : null
                }
                onChange={(o) =>
                  setForm({
                    ...form,
                    kegiatanId: o ? parseInt(o.value, 10) : "",
                  })
                }
                placeholder="Pilih kegiatan..."
              />
              {form.kegiatanId && (
                <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                  Tim:{" "}
                  {kegiatan.find((k) => k.id === form.kegiatanId)?.team
                    ?.nama_tim || "-"}
                </p>
              )}
            </div>

            {/* Tanggal */}
            <div>
              <Label htmlFor="tanggal" className="dark:text-gray-100">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal"
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Deskripsi */}
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

            {/* Status */}
            <div>
              <Label htmlFor="status" className="dark:text-gray-100">
                Status <span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value={STATUS.BELUM}>{STATUS.BELUM}</option>
                <option value={STATUS.SEDANG_DIKERJAKAN}>
                  {STATUS.SEDANG_DIKERJAKAN}
                </option>
                <option value={STATUS.SELESAI_DIKERJAKAN}>
                  {STATUS.SELESAI_DIKERJAKAN}
                </option>
              </select>
            </div>

            {/* Tombol */}
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
              <Button onClick={save}>Simpan</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
