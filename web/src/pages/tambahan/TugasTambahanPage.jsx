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
import { useRef } from "react";

export default function TugasTambahanPage() {
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
  const tanggalRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, kRes, teamRes] = await Promise.all([
        axios.get("/tugas-tambahan"),
        axios.get("/master-kegiatan?limit=1000"),
        axios.get("/teams").then(async (res) => {
          if (Array.isArray(res.data) && res.data.length === 0) {
            return axios.get("/teams/member");
          }
          return res;
        }),
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
        await axios.put(`/tugas-tambahan/${editing.id}`, payload);
      } else {
        await axios.post("/tugas-tambahan", payload);
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
      await axios.delete(`/tugas-tambahan/${item.id}`);
      fetchData();
      showSuccess("Dihapus", "Kegiatan dihapus");
    } catch (err) {
      console.error(err);
      showError("Error", "Gagal menghapus");
    }
  };

  const openDetail = (id) => {
    navigate(`/tugas-tambahan/${id}`);
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
              <td
                colSpan="7"
                className="py-6 text-center text-gray-600 dark:text-gray-300"
              >
                <div className="flex flex-col items-center space-y-2">
                  <svg
                    className="animate-spin h-6 w-6 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.93 
            6.364A8.001 8.001 0 0112 20v4c-6.627 
            0-12-5.373-12-12h4a8.001 8.001 
            0 006.364 2.93z"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium tracking-wide">
                    Memuat data...
                  </span>
                </div>
              </td>
            </tr>
          ) : paginatedItems.length === 0 ? (
            <tr>
              <td
                colSpan="7"
                className="py-6 text-center text-gray-600 dark:text-gray-300"
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-xl">🫰🫰🤟🤟😜☝☝</span>
                  <span className="text-sm font-medium tracking-wide">
                    Data tidak ditemukan.
                  </span>
                </div>
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
                  {item.bukti_link ? (
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
          titleId="tugas-tambahan-modal-title"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              id="tugas-tambahan-modal-title"
              className="text-xl font-semibold"
            >
              {editing ? "Edit Kegiatan" : "Tambah Kegiatan"}
            </h2>
            <p className="text-xs text-red-600 dark:text-red-500">
              * Fardu 'Ain
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="teamId" className="dark:text-gray-100">
                Tim <span className="text-red-500">*</span>
              </Label>
              <select
                id="teamId"
                value={form.teamId}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({
                    ...form,
                    teamId: value ? parseInt(value, 10) : "",
                    kegiatanId: "", // reset kegiatan saat tim berubah
                  });
                }}
                className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 
            dark:bg-gray-700 dark:text-gray-100 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            shadow-sm transition duration-150 ease-in-out"
              >
                <option value="">Pilih Tim</option>
                {teams
                  .filter((t) => t.nama_tim !== "Pimpinan")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama_tim}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <Label htmlFor="kegiatanId" className="dark:text-gray-100">
                Kegiatan <span className="text-red-500">*</span>
              </Label>
              <select
                id="kegiatanId"
                value={form.kegiatanId}
                onChange={(e) =>
                  setForm({ ...form, kegiatanId: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 
            dark:bg-gray-700 dark:text-gray-100 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            shadow-sm transition duration-150 ease-in-out"
                disabled={!form.teamId}
              >
                <option value="">
                  {form.teamId ? "Pilih Kegiatan" : "Pilih Tim terlebih dahulu"}
                </option>
                {kegiatan
                  .filter((k) => k.teamId === form.teamId)
                  .map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_kegiatan}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <Label htmlFor="kegiatanId" className="dark:text-gray-100">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <Input
                ref={tanggalRef}
                id="tanggal"
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                onClick={() => tanggalRef.current?.showPicker()}
                className="w-full cursor-pointer border rounded-lg px-3 py-2 bg-white text-gray-900 
    dark:bg-gray-700 dark:text-gray-100 
    focus:outline-none focus:ring-2 focus:ring-blue-500 
    shadow-sm transition duration-150 ease-in-out"
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
                className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 
            dark:bg-gray-700 dark:text-gray-100 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            shadow-sm transition duration-150 ease-in-out resize-none"
              />
            </div>

            <div>
              <Label htmlFor="status" className="dark:text-gray-100">
                Status <span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 
            dark:bg-gray-700 dark:text-gray-100 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            shadow-sm transition duration-150 ease-in-out"
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
